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
    return Product(
      id: json['id'],
      name: json['name'],
      nameBn: json['name_bn'],
      description: json['description'],
      descriptionBn: json['description_bn'],
      categoryId: json['category_id'],
      price: (json['price'] ?? 0).toDouble(),
      imageUrl: json['image_url'],
      sellerId: json['seller_id'],
      metadata: json['metadata'],
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
