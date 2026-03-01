import 'package:equatable/equatable.dart';

class Product extends Equatable {
  final String id;
  final String sellerId;
  final String sku;
  final String title;
  final String? description;
  final String? category;
  final double basePrice;
  final int stockQuantity;
  final List<String> images;
  final String status;

  const Product({
    required this.id,
    required this.sellerId,
    required this.sku,
    required this.title,
    this.description,
    this.category,
    required this.basePrice,
    required this.stockQuantity,
    required this.images,
    required this.status,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      sellerId: json['seller_id'],
      sku: json['sku'],
      title: json['title'],
      description: json['description'],
      category: json['category'],
      basePrice: (json['base_price'] ?? 0.0).toDouble(),
      stockQuantity: json['stock_quantity'] ?? 0,
      images: List<String>.from(json['images'] ?? []),
      status: json['status'] ?? 'active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'seller_id': sellerId,
      'sku': sku,
      'title': title,
      'description': description,
      'category': category,
      'base_price': basePrice,
      'stock_quantity': stockQuantity,
      'images': images,
      'status': status,
    };
  }

  @override
  List<Object?> get props => [id, sellerId, sku, title, description, category, basePrice, stockQuantity, images, status];
}
