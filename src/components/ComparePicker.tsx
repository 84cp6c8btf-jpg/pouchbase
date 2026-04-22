import { getBrand, type ProductWithBrand } from "@/lib/discovery";

interface ComparePickerProps {
  products: ProductWithBrand[];
  leftSlug?: string;
  rightSlug?: string;
}

export function ComparePicker({ products, leftSlug, rightSlug }: ComparePickerProps) {
  return (
    <form action="/compare" className="rounded-xl border border-white/8 bg-card p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/42">First pouch</span>
          <select
            name="left"
            defaultValue={leftSlug || ""}
            className="pb-input px-3 py-2.5 text-sm"
          >
            <option value="">Select a pouch</option>
            {products.map((product) => {
              const brand = getBrand(product);
              return (
                <option key={product.id} value={product.slug}>
                  {brand?.name ? `${brand.name} · ` : ""}{product.name}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-white/42">Second pouch</span>
          <select
            name="right"
            defaultValue={rightSlug || ""}
            className="pb-input px-3 py-2.5 text-sm"
          >
            <option value="">Select a pouch</option>
            {products.map((product) => {
              const brand = getBrand(product);
              return (
                <option key={product.id} value={product.slug}>
                  {brand?.name ? `${brand.name} · ` : ""}{product.name}
                </option>
              );
            })}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover"
          >
            Compare
          </button>
        </div>
      </div>
    </form>
  );
}
