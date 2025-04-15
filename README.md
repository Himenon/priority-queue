# @himenon/priority-queue

TypeScript による柔軟な優先度付きキュー実装。  
最小ヒープ／最大ヒープを **動的に切り替え可能**で、優先度順に値や関数を安全に処理できます。

## Features

- ✅ **最小／最大ヒープ切り替え**（`setMinHeap()` / `setMaxHeap()`）
- ✅ **優先度に基づく `enqueue` / `dequeue`**
- ✅ **イテレータ・サイズ取得・全要素抽出 (`drain`) 対応**
- ✅ **ジェネリクス対応（任意の型の要素を扱える）**

## Benchmark

![Benchmark](./benchmark.png)
![Memory](./memory.png)

## LICENCE

[@Himenon/priority-queue](https://github.com/Himenon/priority-queue)・MIT
