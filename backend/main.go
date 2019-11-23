package main

import (
	"image/jpeg"
	"log"
	"os"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func main() {
	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
	}))

	e.POST("/image", receiveImage)
	e.Logger.Fatal(e.Start(":8080"))
}

func receiveImage(c echo.Context) error {
	file, err := c.FormFile("file")
	if err != nil {
		return err
	}
	image, err := file.Open()
	if err != nil {
		return err
	}
	defer image.Close()

	imageDecoded, err := jpeg.Decode(image)
	if err != nil {
		log.Fatalf("failed to decode: %s", err)
	}

	third, err := os.Create("result.jpg")
	if err != nil {
		log.Fatalf("failed to create: %s", err)
	}
	jpeg.Encode(third, imageDecoded, &jpeg.Options{jpeg.DefaultQuality})

	return c.File("result.jpg")
}
