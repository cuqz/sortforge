package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/cuqz/array-sorter/models"
)

var Algorithms = []models.AlgorithmInfo{
	{ID: "bubble", Name: "Bubble Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: true, Description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order."},
	{ID: "selection", Name: "Selection Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: false, Description: "Divides the input into a sorted and unsorted region, repeatedly selects the smallest element from the unsorted region."},
	{ID: "insertion", Name: "Insertion Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: true, Description: "Builds the final sorted array one element at a time by repeatedly inserting the next element into the correct position."},
	{ID: "shell", Name: "Shell Sort", Category: "comparison", TimeComplexity: "O(n log\u00b2 n)", Stable: false, Description: "An in-place comparison sort that sorts far apart elements first, then reduces the gap between elements."},
	{ID: "quick", Name: "Quick Sort", Category: "comparison", TimeComplexity: "O(n log n)", Stable: false, Description: "Picks a pivot element and partitions the array around it, then recursively sorts the partitions."},
	{ID: "merge", Name: "Merge Sort", Category: "comparison", TimeComplexity: "O(n log n)", Stable: true, Description: "Divides the array into halves, recursively sorts each half, then merges them back together."},
	{ID: "heap", Name: "Heap Sort", Category: "comparison", TimeComplexity: "O(n log n)", Stable: false, Description: "Builds a max-heap from the data, then repeatedly extracts the maximum element and rebuilds the heap."},
	{ID: "tim", Name: "Tim Sort", Category: "comparison", TimeComplexity: "O(n log n)", Stable: true, Description: "A hybrid stable sorting algorithm derived from merge sort and insertion sort, used in Python and Java."},
	{ID: "cocktail", Name: "Cocktail Shaker Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: true, Description: "A bidirectional bubble sort that passes through the array in both directions."},
	{ID: "comb", Name: "Comb Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: false, Description: "Improves on bubble sort by using a gap larger than 1 and shrinking it by a factor of 1.3 each pass."},
	{ID: "gnome", Name: "Gnome Sort", Category: "comparison", TimeComplexity: "O(n\u00b2)", Stable: true, Description: "Works by moving an element to its correct position through a series of swaps, similar to insertion sort."},
	{ID: "counting", Name: "Counting Sort", Category: "linear", TimeComplexity: "O(n+k)", Stable: true, Description: "Counts the occurrences of each element and uses that to determine the positions of elements in the sorted array."},
	{ID: "radix", Name: "Radix Sort", Category: "linear", TimeComplexity: "O(nk)", Stable: true, Description: "Sorts numbers by processing individual digits from least significant to most significant."},
	{ID: "bucket", Name: "Bucket Sort", Category: "linear", TimeComplexity: "O(n + k)", Stable: true, Description: "Distributes elements into buckets, sorts each bucket individually, then concatenates them."},
	{ID: "bogo", Name: "Bogo Sort", Category: "comparison", TimeComplexity: "O((n+1)!)", Stable: false, Description: "Randomly permutes the array until it is sorted. Included for humor and demonstration."},
}

func AlgorithmsHandler(w http.ResponseWriter, r *http.Request) {
	resp := struct {
		Algorithms []models.AlgorithmInfo `json:"algorithms"`
	}{Algorithms}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
