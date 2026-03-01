package ui

import (
	"fmt"
	"strconv"

	"calcmatxgo/internal/matrix"
	"calcmatxgo/internal/parser"
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

type operation struct {
	Key   string
	Label string
}

var ops = []operation{
	{Key: "determinant", Label: "Определитель"},
	{Key: "transpose", Label: "Транспонировать"},
	{Key: "rank", Label: "Ранг"},
	{Key: "trace", Label: "След"},
	{Key: "power", Label: "Возвести в степень"},
	{Key: "scalar", Label: "Умножить на число"},
	{Key: "inverse", Label: "Обратная"},
	{Key: "triangular", Label: "Треугольный вид"},
	{Key: "echelon", Label: "Ступенчатый вид"},
	{Key: "lu", Label: "LU разложение"},
	{Key: "elementary", Label: "Элементарные преобразования"},
	{Key: "expression", Label: "Вычислить выражение"},
}

func Build(w fyne.Window) {
	selected := ops[0].Key

	matrixA := widget.NewMultiLineEntry()
	matrixA.SetText("1 2 3\n0 1 4\n5 6 0")
	matrixB := widget.NewMultiLineEntry()
	matrixB.SetText("1 0 0\n0 1 0\n0 0 1")
	result := widget.NewMultiLineEntry()
	result.Disable()
	errLabel := widget.NewLabel("")

	powerEntry := widget.NewEntry()
	powerEntry.SetText("2")
	scalarEntry := widget.NewEntry()
	scalarEntry.SetText("2")
	exprEntry := widget.NewEntry()
	exprEntry.SetText("A*B + A")
	elemType := widget.NewSelect([]string{"swap", "scale", "add"}, nil)
	elemType.SetSelected("swap")
	rowI := widget.NewEntry()
	rowI.SetText("1")
	rowJ := widget.NewEntry()
	rowJ.SetText("2")
	factor := widget.NewEntry()
	factor.SetText("1")

	dynamic := container.NewVBox()
	renderDynamic := func() {
		dynamic.RemoveAll()
		switch selected {
		case "power":
			dynamic.Add(widget.NewForm(widget.NewFormItem("Степень", powerEntry)))
		case "scalar":
			dynamic.Add(widget.NewForm(widget.NewFormItem("Коэффициент", scalarEntry)))
		case "elementary":
			dynamic.Add(widget.NewForm(
				widget.NewFormItem("Тип", elemType),
				widget.NewFormItem("i (c 1)", rowI),
				widget.NewFormItem("j (c 1)", rowJ),
				widget.NewFormItem("k", factor),
			))
		case "expression":
			dynamic.Add(widget.NewForm(widget.NewFormItem("Выражение", exprEntry)))
		}
	}

	list := widget.NewList(
		func() int { return len(ops) },
		func() fyne.CanvasObject { return widget.NewLabel("template") },
		func(i widget.ListItemID, o fyne.CanvasObject) {
			o.(*widget.Label).SetText(ops[i].Label)
		},
	)
	list.OnSelected = func(id widget.ListItemID) {
		selected = ops[id].Key
		renderDynamic()
		errLabel.SetText("")
		result.SetText("")
	}
	list.Select(0)

	run := widget.NewButton("Вычислить", func() {
		A, err := matrix.Parse(matrixA.Text, "Матрица A")
		if err != nil {
			errLabel.SetText(err.Error())
			return
		}
		var out string
		switch selected {
		case "determinant":
			v, err := matrix.Determinant(A)
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = fmt.Sprintf("det(A) = %v", v)
		case "transpose":
			m, err := matrix.Transpose(A)
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = m.String()
		case "rank":
			v, err := matrix.Rank(A)
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = fmt.Sprintf("rank(A) = %d", v)
		case "trace":
			v, err := matrix.Trace(A)
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = fmt.Sprintf("tr(A) = %v", v)
		case "power":
			e, err := strconv.Atoi(powerEntry.Text)
			if err != nil {
				errLabel.SetText("Степень должна быть целым числом")
				return
			}
			m, err := matrix.Power(A, e)
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = m.String()
		case "scalar":
			k, err := strconv.ParseFloat(scalarEntry.Text, 64)
			if err != nil {
				errLabel.SetText("Коэффициент должен быть числом")
				return
			}
			m, err := matrix.Scalar(A, k)
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = m.String()
		case "inverse":
			m, err := matrix.Inverse(A)
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = m.String()
		case "triangular":
			m, err := matrix.Triangular(A)
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = m.String()
		case "echelon":
			m, err := matrix.RowEchelon(A)
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = m.String()
		case "lu":
			L, U, err := matrix.LU(A)
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = fmt.Sprintf("L:\n%s\n\nU:\n%s", L.String(), U.String())
		case "elementary":
			i, err := strconv.Atoi(rowI.Text)
			if err != nil {
				errLabel.SetText("i должен быть целым")
				return
			}
			j, err := strconv.Atoi(rowJ.Text)
			if err != nil {
				errLabel.SetText("j должен быть целым")
				return
			}
			k, err := strconv.ParseFloat(factor.Text, 64)
			if err != nil {
				errLabel.SetText("k должен быть числом")
				return
			}
			m, err := matrix.Elementary(A, elemType.Selected, i-1, j-1, k)
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = m.String()
		case "expression":
			B, err := matrix.Parse(matrixB.Text, "Матрица B")
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			m, err := parser.Evaluate(exprEntry.Text, map[string]matrix.Matrix{"A": A, "B": B})
			if err != nil {
				errLabel.SetText(err.Error())
				return
			}
			out = m.String()
		}
		errLabel.SetText("")
		result.SetText(out)
	})

	inputs := container.NewGridWithColumns(2,
		widget.NewForm(widget.NewFormItem("Матрица A", matrixA)),
		widget.NewForm(widget.NewFormItem("Матрица B (для выражений)", matrixB)),
	)
	right := container.NewBorder(nil, container.NewVBox(run, errLabel), nil, nil,
		container.NewVBox(widget.NewLabel("Калькулятор матриц"), inputs, dynamic, widget.NewLabel("Результат"), result))

	left := container.NewBorder(widget.NewLabel("Операции"), nil, nil, nil, list)
	w.SetContent(container.NewHSplit(left, right))
	renderDynamic()
}
