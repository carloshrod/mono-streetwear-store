const ProductPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return <main>Product: {slug}</main>;
};

export default ProductPage;
