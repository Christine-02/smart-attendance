class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class AttendanceList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  insert(data) {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.size++;
  }

  toArray() {
    let arr = [];
    let current = this.head;
    while (current) {
      arr.push(current.data);
      current = current.next;
    }
    return arr;
  }

  clear() {
    this.head = null;
    this.size = 0;
  }

  getSize() {
    return this.size;
  }

  getRecentRecords(limit = 10) {
    const records = this.toArray();
    return records.slice(0, limit);
  }

  removeOldRecords(maxAge = 24 * 60 * 60 * 1000) {
    // Default: 24 hours
    const now = Date.now();
    let current = this.head;
    let previous = null;

    while (current) {
      if (now - current.data.timestamp > maxAge) {
        if (previous) {
          previous.next = current.next;
        } else {
          this.head = current.next;
        }
        this.size--;
      } else {
        previous = current;
      }
      current = current.next;
    }
  }
}

module.exports = AttendanceList;
