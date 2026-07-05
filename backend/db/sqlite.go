package db

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/cuqz/array-sorter/models"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func InitDB(dbPath string) error {
	var err error
	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	createTable := `
	CREATE TABLE IF NOT EXISTS submissions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		is_custom INTEGER NOT NULL DEFAULT 0,
		algorithm_id TEXT NOT NULL,
		array_size INTEGER NOT NULL,
		data_type TEXT NOT NULL,
		speed_ms REAL NOT NULL,
		memory_bytes INTEGER NOT NULL,
		operations INTEGER NOT NULL,
		is_stable INTEGER NOT NULL DEFAULT 0,
		custom_code TEXT NOT NULL DEFAULT '',
		submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
	);`

	if _, err := DB.Exec(createTable); err != nil {
		return fmt.Errorf("failed to create table: %w", err)
	}

	return nil
}

func InsertSubmission(s models.Submission) (int64, error) {
	var isCustomInt, isStableInt int
	if s.IsCustom {
		isCustomInt = 1
	}
	if s.IsStable {
		isStableInt = 1
	}

	result, err := DB.Exec(
		`INSERT INTO submissions (name, is_custom, algorithm_id, array_size, data_type, speed_ms, memory_bytes, operations, is_stable, custom_code)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		s.Name, isCustomInt, s.AlgorithmID, s.ArraySize, s.DataType, s.SpeedMs, s.MemoryBytes, s.Operations, isStableInt, s.CustomCode,
	)
	if err != nil {
		return 0, fmt.Errorf("failed to insert submission: %w", err)
	}

	return result.LastInsertId()
}

func GetLeaderboard(algorithmID, dataType, sortBy string, limit int) ([]models.Submission, error) {
	query := `SELECT id, name, is_custom, algorithm_id, array_size, data_type, speed_ms, memory_bytes, operations, is_stable, custom_code, submitted_at FROM submissions`
	var conditions []string
	var args []interface{}

	if algorithmID != "" {
		conditions = append(conditions, "algorithm_id = ?")
		args = append(args, algorithmID)
	}
	if dataType != "" {
		conditions = append(conditions, "data_type = ?")
		args = append(args, dataType)
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	desc := false
	if strings.HasPrefix(sortBy, "-") {
		desc = true
		sortBy = sortBy[1:]
	}
	order := "ASC"
	if desc {
		order = "DESC"
	}
	switch sortBy {
	case "memory", "memory_bytes":
		query += " ORDER BY memory_bytes " + order
	case "operations":
		query += " ORDER BY operations " + order
	case "speed", "speed_ms":
		query += " ORDER BY speed_ms " + order
	default:
		query += " ORDER BY speed_ms ASC"
	}

	query += " LIMIT ?"
	args = append(args, limit)

	rows, err := DB.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query leaderboard: %w", err)
	}
	defer rows.Close()

	var submissions []models.Submission
	for rows.Next() {
		var s models.Submission
		var isCustomInt, isStableInt int
		if err := rows.Scan(&s.ID, &s.Name, &isCustomInt, &s.AlgorithmID, &s.ArraySize, &s.DataType, &s.SpeedMs, &s.MemoryBytes, &s.Operations, &isStableInt, &s.CustomCode, &s.SubmittedAt); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		s.IsCustom = isCustomInt == 1
		s.IsStable = isStableInt == 1
		submissions = append(submissions, s)
	}

	return submissions, nil
}

func GetStats() (*models.StatsResponse, error) {
	var total int
	err := DB.QueryRow("SELECT COUNT(*) FROM submissions").Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count submissions: %w", err)
	}

	var uniqueUsers int
	err = DB.QueryRow("SELECT COUNT(DISTINCT name) FROM submissions").Scan(&uniqueUsers)
	if err != nil {
		return nil, fmt.Errorf("failed to count unique users: %w", err)
	}

	stats := &models.StatsResponse{
		TotalSubmissions: total,
		UniqueUsers:      uniqueUsers,
	}

	var fastestID sql.NullString
	var bestTime sql.NullFloat64
	err = DB.QueryRow("SELECT algorithm_id, MIN(speed_ms) FROM submissions").Scan(&fastestID, &bestTime)
	if err == nil && fastestID.Valid && bestTime.Valid {
		stats.FastestAlgorithm = &models.FastestAlgo{
			ID:       fastestID.String,
			BestTime: bestTime.Float64,
		}
	}

	var mostID sql.NullString
	var mostCount sql.NullInt64
	err = DB.QueryRow("SELECT algorithm_id, COUNT(*) as cnt FROM submissions GROUP BY algorithm_id ORDER BY cnt DESC LIMIT 1").Scan(&mostID, &mostCount)
	if err == nil && mostID.Valid && mostCount.Valid {
		stats.MostSubmissions = &models.MostSubmissionsAlgo{
			AlgorithmID: mostID.String,
			Count:       int(mostCount.Int64),
		}
	}

	return stats, nil
}
