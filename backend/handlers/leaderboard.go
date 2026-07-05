package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/cuqz/array-sorter/db"
	"github.com/cuqz/array-sorter/models"
)

func SubmitHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var s models.Submission
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	s.Name = strings.TrimSpace(s.Name)
	if s.Name == "" || len(s.Name) > 100 {
		http.Error(w, "name is required (max 100 chars)", http.StatusBadRequest)
		return
	}
	s.Name = sanitizeName(s.Name)
	if s.AlgorithmID == "" {
		http.Error(w, "algorithm_id is required", http.StatusBadRequest)
		return
	}
	if s.DataType == "" {
		http.Error(w, "data_type is required", http.StatusBadRequest)
		return
	}
	if s.ArraySize <= 0 {
		http.Error(w, "array_size must be positive", http.StatusBadRequest)
		return
	}
	if s.SpeedMs <= 0 {
		http.Error(w, "speed_ms must be positive", http.StatusBadRequest)
		return
	}

	id, err := db.InsertSubmission(s)
	if err != nil {
		http.Error(w, "failed to record submission", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      id,
		"message": "submission recorded",
	})
}

func LeaderboardHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	q := r.URL.Query()
	algorithmID := q.Get("algorithm_id")
	dataType := q.Get("data_type")
	sortBy := q.Get("sort_by")
	if sortBy == "" {
		sortBy = "speed"
	}

	limit := 50
	if l := q.Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	submissions, err := db.GetLeaderboard(algorithmID, dataType, sortBy, limit)
	if err != nil {
		http.Error(w, "failed to query leaderboard", http.StatusInternalServerError)
		return
	}

	if submissions == nil {
		submissions = []models.Submission{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.LeaderboardResponse{Submissions: submissions})
}

func sanitizeName(name string) string {
	var safe strings.Builder
	for _, r := range name {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == ' ' || r == '-' || r == '_' || r == '.' {
			safe.WriteRune(r)
		}
	}
	result := safe.String()
	if len(result) > 50 {
		result = result[:50]
	}
	return result
}

func StatsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	stats, err := db.GetStats()
	if err != nil {
		http.Error(w, "failed to get stats", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
