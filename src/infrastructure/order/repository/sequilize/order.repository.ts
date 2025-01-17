import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {

    try {
      await OrderModel.create(
        {
          id: entity.id,
          customer_id: entity.customerId,
          total: entity.total(),
          items: entity.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            product_id: item.productId,
            quantity: item.quantity,
          })),
        },
        {
          include: [{ model: OrderItemModel }],
        }
      );
    } catch (error) {
      throw new Error("Order not created");
    }
  }
  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        id: entity.id,
        customerId: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
      { where: { id: entity.id } }
    );
  }

  async find(id: string): Promise<Order> {
    
    try {
      const orderModel = await OrderModel.findOne({ 
        where: { id } ,
        include: [{ model: OrderItemModel }],
      });
      const items: Array<OrderItem> = [];
  
      for (const iterator of orderModel.items) {
        items.push(
          new OrderItem(
            iterator.id,
            iterator.name,
            iterator.price,
            iterator.product_id,
            iterator.quantity
          )
        );
      }
      return new Order(orderModel.id, orderModel.customer_id, items);
    } catch (error) {
      throw new Error("Order not found");
    }
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({ include: [{ model: OrderItemModel }] });

    const orders = orderModels.map((orderModels) => {
      const items: Array<OrderItem> = [];
  
      for (const iterator of orderModels.items) {
        items.push(
          new OrderItem(
            iterator.id,
            iterator.name,
            iterator.price,
            iterator.product_id,
            iterator.quantity
          )
        );
      }
      let order = new Order(orderModels.id, orderModels.customer_id, items);

      return order;
    });

    return orders;
  }
}
