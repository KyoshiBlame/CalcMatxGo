package main

import (
	"calcmatxgo/internal/ui"
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
)

func main() {
	a := app.New()
	w := a.NewWindow("CalcMatxGo")
	w.Resize(fyne.NewSize(1200, 760))
	ui.Build(w)
	w.ShowAndRun()
}
