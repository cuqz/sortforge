package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/cuqz/array-sorter/models"
)

var Algorithms = []models.AlgorithmInfo{
	{ID: "bubble", Name: "Bubble Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: true, Description: "Classic adjacent-swap sort. Slow but every CS student writes it once."},
	{ID: "selection", Name: "Selection Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: false, Description: "Picks the smallest element each pass. Worst of both worlds on comparisons and swaps."},
	{ID: "insertion", Name: "Insertion Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: true, Description: "Good for small or nearly-sorted arrays. Builds the sorted array one element at a time."},
	{ID: "shell", Name: "Shell Sort", Category: "comparison", TimeComplexity: "O(n log\u00b2 n)", Stable: false, Description: "Insertion sort with a decreasing gap. First O(n log n) sort to be discovered."},
	{ID: "quick", Name: "Quick Sort", Category: "comparison", TimeComplexity: "O(n log n)", Stable: false, Description: "Pivot, partition, recurse. Fast in practice unless data is already sorted with a bad pivot."},
	{ID: "merge", Name: "Merge Sort", Category: "comparison", TimeComplexity: "O(n log n)", Stable: true, Description: "Divide-and-conquer. Splits to single elements, merges back up in sorted order."},
	{ID: "heap", Name: "Heap Sort", Category: "comparison", TimeComplexity: "O(n log n)", Stable: false, Description: "Builds a heap, pops the max repeatedly. Consistent O(n log n) but not stable."},
	{ID: "tim", Name: "Tim Sort", Category: "comparison", TimeComplexity: "O(n log n)", Stable: true, Description: "Hybrid of merge and insertion sort. Powers Python's sort and V8's Array.sort()."},
	{ID: "cocktail", Name: "Cocktail Shaker Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: true, Description: "Bubble sort but bidirectional. Shakes left-to-right then right-to-left each pass."},
	{ID: "comb", Name: "Comb Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: false, Description: "Bubble sort with a shrinking gap. Shrink factor of 1.3 is empirically best."},
	{ID: "gnome", Name: "Gnome Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: true, Description: "Like insertion sort if it were drunk. Swaps backward until in position."},
	{ID: "counting", Name: "Counting Sort", Category: "linear", TimeComplexity: "O(n+k)", Stable: true, Description: "Integer-only. Counts occurrences and reconstructs. Falls back to native sort if range too large."},
	{ID: "radix", Name: "Radix Sort", Category: "linear", TimeComplexity: "O(nk)", Stable: true, Description: "Sorts digit-by-digit from LSD to MSD. Counting sort as a subroutine."},
	{ID: "bucket", Name: "Bucket Sort", Category: "linear", TimeComplexity: "O(n + k)", Stable: true, Description: "Distributes into buckets, sorts each bucket, concatenates. Good for uniform distributions."},
	{ID: "bogo", Name: "Bogo Sort", Category: "comparison", TimeComplexity: "O((n+1)!)", Stable: false, Description: "Shuffles randomly until sorted. Included because it is funny. Gives up after 1000 tries."},
}

func AlgorithmsHandler(w http.ResponseWriter, r *http.Request) {
	resp := struct {
		Algorithms []models.AlgorithmInfo `json:"algorithms"`
	}{Algorithms}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
