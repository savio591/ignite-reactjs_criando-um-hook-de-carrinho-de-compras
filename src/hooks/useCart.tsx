import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast, useToast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";
import { useProducts } from "./useProducts";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });


  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];

      const productExists = updatedCart.find(item => item.id === productId)

      const stock: {data: Stock} = await api.get(`/stock/${productId}`);

      const stockAmount = stock.data.amount

      const currentAmount = productExists ? productExists.amount : 0

      const amount = currentAmount + 1;

      if(amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      if(productExists) {
        productExists.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`)

        const newProduct = {
          ...product.data, amount: 1
        }

        updatedCart.push(newProduct)
      }

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))

      
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart];

      const productExists = updatedCart.find(item => item.id === productId)

      if (!productExists) {
        toast.error('Erro na remoção do produto');
        return;
      } 
      const cartWithProductRemoved = cart.filter(
        (item) => productId !== item.id
      );

      localStorage.setItem(
        "@RocketShoes:cart",
        JSON.stringify(cartWithProductRemoved)
      );
      setCart(cartWithProductRemoved);
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const updatedCart = [...cart];

      const productExists = updatedCart.find(item => item.id === productId)

      const stock: {data: Stock} = await api.get(`/stock/${productId}`);

      const stockAmount = stock.data.amount

      const currentAmount = productExists ? productExists.amount : 0

      const amount = currentAmount + 1;

      if(amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      if(productExists) {
        productExists.amount = amount;
      } else {
        toast.error('Erro na alteração de quantidade do produto');
        return;
      }

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
