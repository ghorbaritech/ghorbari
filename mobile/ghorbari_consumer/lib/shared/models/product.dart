class Product {
  final String id;
  final String name;
  final String? nameBn;
  final String? description;
  final String? descriptionBn;
  final String categoryId;
  final double price;
  final String? imageUrl;
  final String? sellerId;
  final Map<String, dynamic>? metadata;

  Product({
    required this.id,
    required this.name,
    this.nameBn,
    this.description,
    this.descriptionBn,
    required this.categoryId,
    required this.price,
    this.imageUrl,
    this.sellerId,
    this.metadata,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    double parsePrice(dynamic p) {
      if (p == null) return 0.0;
      if (p is num) return p.toDouble();
      return double.tryParse(p.toString()) ?? 0.0;
    }

    return Product(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Untitled Product',
      nameBn: json['name_bn']?.toString(),
      description: json['description']?.toString(),
      descriptionBn: json['description_bn']?.toString(),
      categoryId: json['category_id']?.toString() ?? '',
      price: parsePrice(json['price']),
      imageUrl: json['image_url']?.toString(),
      sellerId: json['seller_id']?.toString(),
      metadata: json['metadata'] is Map ? Map<String, dynamic>.from(json['metadata']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'name_bn': nameBn,
      'description': description,
      'description_bn': descriptionBn,
      'category_id': categoryId,
      'price': price,
      'image_url': imageUrl,
      'seller_id': sellerId,
      'metadata': metadata,
    };
  }
}
