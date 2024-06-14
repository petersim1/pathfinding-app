class PriorityQueue {
  heap: { element: [number, number]; value: number }[];

  constructor() {
    this.heap = [];
  }

  // Insert an element with a priority into the heap
  enqueue(element: [number, number], value: number): void {
    const node = { element, value };
    this.heap.push(node);
    this._heapifyUp();
  }

  // Remove and return the element with the highest priority (lowest priority value)
  dequeue(): { element: [number, number]; value: number } {
    if (this.isEmpty()) {
      return { element: [0, 0], value: 0 };
    }
    if (this.size() === 1) {
      return this.heap.pop()!;
    }
    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this._heapifyDown();
    return root;
  }

  // Return the size of the heap
  size(): number {
    return this.heap.length;
  }

  // Check if the heap is empty
  isEmpty(): boolean {
    return this.size() === 0;
  }

  // Move the element at the last position up to maintain the heap property
  _heapifyUp(): void {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[parentIdx].value <= this.heap[index].value) {
        break;
      }
      [this.heap[parentIdx], this.heap[index]] = [
        this.heap[index],
        this.heap[parentIdx],
      ];
      index = parentIdx;
    }
  }

  // Move the element at the root position down to maintain the heap property
  _heapifyDown(): void {
    let index = 0;
    const length = this.heap.length;
    const element = this.heap[0];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const leftChildIdx = 2 * index + 1;
      const rightChildIdx = 2 * index + 2;
      let swapIdx = null;

      if (leftChildIdx < length) {
        if (this.heap[leftChildIdx].value < element.value) {
          swapIdx = leftChildIdx;
        }
      }
      if (rightChildIdx < length) {
        if (
          (swapIdx === null &&
            this.heap[rightChildIdx].value < element.value) ||
          (swapIdx !== null &&
            this.heap[rightChildIdx].value < this.heap[swapIdx].value)
        ) {
          swapIdx = rightChildIdx;
        }
      }
      if (swapIdx === null) {
        break;
      }
      this.heap[index] = this.heap[swapIdx];
      this.heap[swapIdx] = element;
      index = swapIdx;
    }
  }
}

export default PriorityQueue;
