// Based on Heap implementation from https://blog.bitsrc.io/implementing-heaps-in-javascript-c3fbf1cb2e65
export class MinHeap {
    constructor(elementValueGetter) {
        this.heap = [null];
        this.elementValueGetter = elementValueGetter;
    }
    get size() {
        return this.heap.length - 1;
    }
    insert(element) {
        this.heap.push(element);
        if (this.heap.length > 1) {
            let current = this.heap.length - 1;
            while (current > 1 && this.elementValueGetter(this.heap[Math.floor(current / 2)]) > this.elementValueGetter(this.heap[current])) {
                [this.heap[Math.floor(current / 2)], this.heap[current]] = [this.heap[current], this.heap[Math.floor(current / 2)]];
                current = Math.floor(current / 2);
            }
        }
    }
    removeSmallest() {
        let smallest = this.heap[1];
        if (this.heap.length > 2) {
            this.heap[1] = this.heap[this.heap.length - 1];
            this.heap.splice(this.heap.length - 1);
            if (this.heap.length === 3) {
                if (this.elementValueGetter(this.heap[1]) > this.elementValueGetter(this.heap[2])) {
                    [this.heap[1], this.heap[2]] = [this.heap[2], this.heap[1]];
                }
                return smallest;
            }
            let current = 1;
            let leftChildIndex = current * 2;
            let rightChildIndex = current * 2 + 1;
            while (this.heap[leftChildIndex] &&
                this.heap[rightChildIndex] &&
                (this.elementValueGetter(this.heap[current]) > this.elementValueGetter(this.heap[leftChildIndex]) ||
                    this.elementValueGetter(this.heap[current]) > this.elementValueGetter(this.heap[rightChildIndex]))) {
                if (this.elementValueGetter(this.heap[leftChildIndex]) < this.elementValueGetter(this.heap[rightChildIndex])) {
                    [this.heap[current], this.heap[leftChildIndex]] = [this.heap[leftChildIndex], this.heap[current]];
                    current = leftChildIndex;
                }
                else {
                    [this.heap[current], this.heap[rightChildIndex]] = [this.heap[rightChildIndex], this.heap[current]];
                    current = rightChildIndex;
                }
                leftChildIndex = current * 2;
                rightChildIndex = current * 2 + 1;
            }
        }
        else if (this.heap.length === 2) {
            this.heap.splice(1, 1);
        }
        else {
            return null;
        }
        return smallest;
    }
    includes(element) {
        return this.heap.includes(element);
    }
    find(predicate) {
        return this.heap.find(predicate);
    }
}
