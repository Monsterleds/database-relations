import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    if (!customer_id || !products) {
      throw new AppError('Missing some arguments like customer_id or products');
    }

    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exists');
    }

    const allProducts = await this.productsRepository.findAllById(products);

    if (products.length !== allProducts.length) {
      throw new AppError('Products not found');
    }

    const orderProducts = products.map(product => {
      const findProductId = allProducts.find(
        mainProduct => mainProduct.id === product.id,
      );

      if (!findProductId) {
        throw new AppError('Product not found');
      }

      const order = {
        product_id: findProductId.id,
        price: findProductId.price,
        quantity: product.quantity,
      };

      return order;
    });

    const newProducts = allProducts.map(data => {
      const product = products.find(response => response.id === data.id);

      if (!product) {
        throw new AppError('Product does not exists');
      }

      const totalQuantity = data.quantity - product.quantity;

      if (totalQuantity < 0) {
        throw new AppError('Product sold out');
      }

      Object.assign(data, { quantity: totalQuantity });

      return data;
    });

    await this.productsRepository.updateQuantity(newProducts);

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    return order;
  }
}

export default CreateOrderService;
