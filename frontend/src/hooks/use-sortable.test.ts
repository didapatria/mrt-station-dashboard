import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSortable } from "@/hooks/use-sortable";

interface TestItem {
  name: string;
  age: number;
  city: string;
}

const data: TestItem[] = [
  { name: "Charlie", age: 30, city: "Jakarta" },
  { name: "Alice", age: 25, city: "Bandung" },
  { name: "Bob", age: 35, city: "Surabaya" },
];

describe("useSortable", () => {
  it("should return data unsorted when no default key", () => {
    const { result } = renderHook(() => useSortable(data));
    expect(result.current.sorted).toEqual(data);
    expect(result.current.sortConfig.key).toBeNull();
  });

  it("should sort by default key ascending", () => {
    const { result } = renderHook(() => useSortable(data, "name"));
    expect(result.current.sorted[0].name).toBe("Alice");
    expect(result.current.sorted[1].name).toBe("Bob");
    expect(result.current.sorted[2].name).toBe("Charlie");
  });

  it("should toggle sort direction on same key", () => {
    const { result } = renderHook(() => useSortable(data, "name"));

    expect(result.current.sortConfig.direction).toBe("asc");

    act(() => result.current.requestSort("name"));
    expect(result.current.sortConfig.direction).toBe("desc");
    expect(result.current.sorted[0].name).toBe("Charlie");

    act(() => result.current.requestSort("name"));
    expect(result.current.sortConfig.direction).toBe("asc");
    expect(result.current.sorted[0].name).toBe("Alice");
  });

  it("should sort numbers correctly", () => {
    const { result } = renderHook(() => useSortable(data, "age"));
    expect(result.current.sorted[0].age).toBe(25);
    expect(result.current.sorted[2].age).toBe(35);
  });

  it("should reset to asc when switching keys", () => {
    const { result } = renderHook(() => useSortable(data, "name"));

    act(() => result.current.requestSort("name"));
    expect(result.current.sortConfig.direction).toBe("desc");

    act(() => result.current.requestSort("age"));
    expect(result.current.sortConfig.key).toBe("age");
    expect(result.current.sortConfig.direction).toBe("asc");
  });
});
