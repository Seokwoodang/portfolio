"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { RefreshCcw, Calendar } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { BlogPost, ITEMS_PER_PAGE, formatDate } from "@/config/data/blog";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 페이지네이션 계산
  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  // 일반 데이터 로드
  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/blog");
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("블로그 포스트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 크롤링 및 새로고침
  const refreshPosts = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/blog/crawl", { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("블로그 포스트를 업데이트하는데 실패했습니다.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">Blog Posts</h2>
          <button
            onClick={refreshPosts}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow disabled:opacity-50"
          >
            <RefreshCcw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="text-sm md:text-base">새로고침</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchPosts}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            블로그 포스트를 찾을 수 없습니다.
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentPosts.map((post, index) => (
                  <motion.li
                    key={post.link}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 md:p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 
                                       group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                          >
                            {post.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(post.published_at)}</span>
                            </div>
                            {post.category && (
                              <span
                                className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600 
                                           text-gray-600 dark:text-gray-300 text-xs md:text-sm"
                              >
                                {post.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
