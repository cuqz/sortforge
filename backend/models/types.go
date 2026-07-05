package models

type Submission struct {
	ID          int64   `json:"id"`
	Name        string  `json:"name"`
	IsCustom    bool    `json:"is_custom"`
	AlgorithmID string  `json:"algorithm_id"`
	ArraySize   int     `json:"array_size"`
	DataType    string  `json:"data_type"`
	SpeedMs     float64 `json:"speed_ms"`
	MemoryBytes int64   `json:"memory_bytes"`
	Operations  int64   `json:"operations"`
	IsStable    bool    `json:"is_stable"`
	CustomCode  string  `json:"custom_code"`
	SubmittedAt string  `json:"submitted_at"`
}

type AlgorithmInfo struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Category       string `json:"category"`
	TimeComplexity string `json:"timeComplexity"`
	Stable         bool   `json:"stable"`
	Description    string `json:"description"`
}

type LeaderboardResponse struct {
	Submissions []Submission `json:"submissions"`
}

type StatsResponse struct {
	TotalSubmissions int                `json:"total_submissions"`
	UniqueUsers      int                `json:"unique_users"`
	FastestAlgorithm *FastestAlgo       `json:"fastest_algorithm"`
	MostSubmissions  *MostSubmissionsAlgo `json:"most_submissions"`
}

type FastestAlgo struct {
	ID      string  `json:"id"`
	BestTime float64 `json:"best_time"`
}

type MostSubmissionsAlgo struct {
	AlgorithmID string `json:"algorithm_id"`
	Count       int    `json:"count"`
}
