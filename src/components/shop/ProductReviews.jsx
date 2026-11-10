import React from 'react';
import { getProductReviews, getReviewSummary } from '../../utils/product';

export default function ProductReviews({ product }) {
  const reviews = getProductReviews(product);
  const { count: reviewCount, rating } = getReviewSummary(product);
  return (
            <section aria-label="고객 구매 후기" className="space-y-7">
              {reviewCount === 0 ? (
                <div className="py-14 text-center border-y border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-semibold">아직 등록된 구매 후기가 없습니다.</h3>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">구매 고객의 후기가 등록되면 이곳에서 확인할 수 있습니다.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-6 py-6 border-y border-slate-200 dark:border-slate-800">
                    {rating != null && <div className="text-3xl font-semibold tabular-nums">{Number(rating).toFixed(1)}<span className="text-sm font-normal text-slate-500"> / 5</span></div>}
                    <div><h3 className="text-sm font-semibold">구매 고객 평점</h3><p className="text-xs text-slate-500 dark:text-slate-400 mt-2">등록된 구매 후기 {reviewCount}개 기준</p></div>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {reviews.map((review, index) => <article key={review.id || index} className="py-6">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400"><span className="font-medium text-slate-900 dark:text-white">{review.author || '구매 고객'}</span>{review.date && <time>{review.date}</time>}</div>
                      {review.rating != null && <p className="mt-3 text-xs">평점 {review.rating} / 5</p>}
                      <p className="mt-3 text-sm leading-7 whitespace-pre-line text-slate-600 dark:text-slate-300">{review.content}</p>
                    </article>)}
                    {!reviews.length && <p className="text-sm text-slate-500 dark:text-slate-400 py-8">현재 조회할 수 있는 후기 본문이 없습니다.</p>}
                  </div>
                </>
              )}
            </section>
  );
}
