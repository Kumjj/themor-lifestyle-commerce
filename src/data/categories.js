export const CATEGORIES = [
  { id: 'all', name: '전체 상품', icon: 'Grid' },
  { id: 'living', name: '가구 & 홈데코', icon: 'Armchair', subcategories: ['소파/체어', '수납/서랍', '침실가구', '조명/홈데코'] },
  { id: 'kitchen', name: '주방 & 다이닝', icon: 'UtensilsCrossed', subcategories: ['식기/그릇', '조리도구', '밀폐/보관용기', '주방수납'] },
  { id: 'lifestyle', name: '생활 & 수납', icon: 'Package', subcategories: ['욕실용품', '세탁/청소', '정리박스', '일용잡화'] },
  { id: 'digital', name: '디지털 & 소형가전', icon: 'Laptop', subcategories: ['스마트홈', '공기청정/계절', '음향/충전기', '데스크테리어'] },
  { id: 'fashion', name: '패션 & 오피스', icon: 'Briefcase', subcategories: ['가방/파우치', '문구/사무용품', '의류케어', '여행용품'] },
  { id: 'food', name: '신선 & 가공식품', icon: 'Coffee', subcategories: ['커피/티', '건강간식', '밀키트/양념', '산지직송'] }
];

export const SORT_OPTIONS = [
  { value: 'popular', label: '추천순' },
  { value: 'newest', label: '신상품순' },
  { value: 'low-price', label: '낮은 가격순' },
  { value: 'high-price', label: '높은 가격순' },
  { value: 'rating', label: '평점 높은순' }
];
