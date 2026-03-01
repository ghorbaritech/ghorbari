import 'package:equatable/equatable.dart';

class Order extends Equatable {
  final String id;
  final String userId;
  final String status;
  final double totalAmount;
  final DateTime createdAt;
  final List<OrderItem> items;

  const Order({
    required this.id,
    required this.userId,
    required this.status,
    required this.totalAmount,
    required this.createdAt,
    this.items = const [],
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      userId: json['customer_id'] ?? '',
      status: json['status'],
      totalAmount: (json['total_amount'] ?? 0.0).toDouble(),
      createdAt: DateTime.parse(json['created_at']),
      items: (json['items'] as List?)?.map((i) => OrderItem.fromJson(i)).toList() ?? [],
    );
  }

  @override
  List<Object?> get props => [id, userId, status, totalAmount, createdAt, items];
}

class OrderItem extends Equatable {
  final String productId;
  final String productName;
  final int quantity;
  final double price;

  const OrderItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.price,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['productId'] ?? json['product_id'] ?? json['id'] ?? '',
      productName: json['title'] ?? json['product_name'] ?? json['productName'] ?? json['name'] ?? 'Product',
      quantity: json['quantity'] ?? 1,
      price: (json['price'] ?? 0.0).toDouble(),
    );
  }

  @override
  List<Object?> get props => [productId, productName, quantity, price];
}
