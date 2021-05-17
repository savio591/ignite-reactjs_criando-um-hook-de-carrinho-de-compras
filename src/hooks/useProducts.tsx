import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
// import { toast } from 'react-toastify';
import { api } from "../services/api";
import { Product } from "../types";
import { formatPrice } from "../util/format";

interface ProductsProviderProps {
  children: ReactNode;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

const ProductsContext = createContext<ProductFormatted[]>([]);

export function ProductsProvider({ children }: ProductsProviderProps) {
  const [products, setProducts] = useState<ProductFormatted[]>(
    [] as ProductFormatted[]
  );

  useEffect( () => {
    async function loadProducts(): Promise<void> {
      api("/products").then((response: { data: Product[] }) =>
        setProducts(
          response.data.map((product) => {
            const priceFormatted = formatPrice(product.price);
            const productFormatted = {
              ...product,
              priceFormatted,
            };

            return productFormatted;
          })
        )
      );
    }

    loadProducts();
  }, []);

  return (
    <ProductsContext.Provider value={products}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductFormatted[] {
  const context = useContext(ProductsContext);

  return context;
}
