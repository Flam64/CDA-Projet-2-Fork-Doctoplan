package main

import (
	"fmt"
	"log"
	"net"
	"os"

	"logs-server/internal/config"
	grpc "logs-server/internal/grpc"
	"logs-server/internal/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	grpc_go "google.golang.org/grpc"
)

func main() {
	if _, err := os.Stat(".env"); err == nil {
		err := godotenv.Load()
		if err != nil {
			log.Println("Warning: Error loading .env file")
		}
	}

	port := os.Getenv("PORT")
	grpcPort := os.Getenv("GRPC_PORT")

	if port == "" {
		log.Println("PORT is not set, using default port 3333")
		port = "3333"
	}

	config.InitDatabase()
	config.InitRedis()

	if grpcPort == "" {
		log.Println("GRPC_PORT is not set, using default port 50051")
		grpcPort = "50051"
	}

	go startGrpcServer(grpcPort)

	server := gin.Default()

	server.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	server.GET("/", handlers.GetLogs)
	server.GET("/logs", handlers.GetLogs)
	server.GET("/logs/:id", handlers.GetLogById)
	server.Run(":" + port)
}

func startGrpcServer(grpcPort string) {
	lis, err := net.Listen("tcp", ":"+grpcPort)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc_go.NewServer()
	grpc.RegisterGrpcServer(s)

	fmt.Printf("gRPC server listening on :%s\n", grpcPort)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
