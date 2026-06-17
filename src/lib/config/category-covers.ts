/**
 * Static cover images for the homepage "Shop by Category" section, keyed by
 * category slug (must match `categories.slug` in Supabase). Add one or more
 * URLs per gender — when a category has multiple, one is picked at random
 * on each request.
 */
export const categoryCovers: Record<
  string,
  { men?: string[]; women?: string[] }
> = {
  "t-shirts": {
    men: [
      "https://images.pexels.com/photos/6309285/pexels-photo-6309285.jpeg",
      "https://images.pexels.com/photos/2097644/pexels-photo-2097644.jpeg",
      "https://images.unsplash.com/photo-1626806851009-c98659eb1af0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c3RyZWV0d2VhciUyMHQlMjBzaGlydHMlMjBjb3ZlciUyMG1lbnxlbnwwfHwwfHx8MA%3D%3D",
    ],
    women: [
      "https://images.unsplash.com/photo-1685551207147-ad48e61bf72f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHN0cmVldHdlYXIlMjB0JTIwc2hpcnRzJTIwY292ZXIlMjB3b21lbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1628730992773-5185cc8efca9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHN0cmVldHdlYXIlMjB0JTIwc2hpcnRzJTIwY292ZXIlMjB3b21lbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1738636591526-bfcb5328cdcf?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
  },
  hoodies: {
    men: [
      "https://images.pexels.com/photos/28071767/pexels-photo-28071767.jpeg",
      "https://images.pexels.com/photos/11246926/pexels-photo-11246926.jpeg",
    ],
    women: [
      "https://images.unsplash.com/photo-1685354217981-26c14a211bf8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3RyZWV0d2VhciUyMGhvb2RpZXMlMjBjb3ZlciUyMHdvbWVufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1739430170419-a3a0ad7833cb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fHN0cmVldHdlYXIlMjBob29kaWVzJTIwY292ZXIlMjB3b21lbnxlbnwwfHwwfHx8MA%3D%3D",
    ],
  },
  outerwear: {
    men: [
      "https://images.pexels.com/photos/19382099/pexels-photo-19382099.jpeg",
      "https://images.unsplash.com/photo-1629952437798-c025f2801095?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fHN0cmVldHdlYXIlMjBvdXRlcndlYXIlMjBjb3ZlcnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1640753138783-feb605ed090b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODR8fHN0cmVldHdlYXIlMjBvdXRlcndlYXIlMjBjb3ZlcnxlbnwwfHwwfHx8MA%3D%3D",
    ],
    women: [
      "https://images.pexels.com/photos/36727245/pexels-photo-36727245.jpeg",
      "https://images.pexels.com/photos/7585613/pexels-photo-7585613.jpeg",
      "https://images.unsplash.com/photo-1616367581936-e67f06ebe550?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
  },
  bottoms: {
    men: [
      "https://images.pexels.com/photos/17504586/pexels-photo-17504586.jpeg",
      "https://images.pexels.com/photos/14730229/pexels-photo-14730229.jpeg",
    ],
    women: [
      "https://images.unsplash.com/photo-1651050029952-a92c95b8f109?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHN0cmVldHdlYXIlMjBib3R0b21zfGVufDB8fDB8fHww",
      "https://images.pexels.com/photos/3840087/pexels-photo-3840087.jpeg",
    ],
  },
  headwear: {
    men: [
      "https://images.unsplash.com/photo-1722396433927-a9322793d793?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fHN0cmVldHdlYXIlMjBhY2Nlc29yaWVzJTIwY292ZXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1624518681328-bc59eefa1ce4?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    women: [
      "https://images.unsplash.com/photo-1741848885185-102ff5e200d4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhbmllc3xlbnwwfHwwfHx8MA%3D%3D",
    ],
  },
  accessories: {
    men: [
      "https://plus.unsplash.com/premium_photo-1761431319771-a84d73e6aee3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1781093959467-3e30856b4b72?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE2fHx8ZW58MHx8fHx8",
    ],
    women: [
      "https://images.unsplash.com/photo-1555825243-51b2b5931946?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1661347365630-8df7327cdd71?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNhbnZhcyUyMHRvdGV8ZW58MHx8MHx8fDA%3D",
    ],
  },
};
