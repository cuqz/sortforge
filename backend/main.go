package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"github.com/cuqz/array-sorter/db"
	"github.com/cuqz/array-sorter/handlers"
)

func main() {
	addr := flag.String("addr", ":8080", "server address")
	dbPath := flag.String("db", "array-sorter.db", "sqlite database path")
	flag.Parse()

	if err := db.InitDB(*dbPath); err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/api/algorithms", handlers.AlgorithmsHandler)
	mux.HandleFunc("/api/submissions", handlers.SubmitHandler)
	mux.HandleFunc("/api/leaderboard/stats", handlers.StatsHandler)
	mux.HandleFunc("/api/leaderboard", handlers.LeaderboardHandler)

	handler := handlers.CORSMiddleware(mux)

	fmt.Printf("array-sorter backend listening on %s\n", *addr)
	log.Fatal(http.ListenAndServe(*addr, handler))
}
