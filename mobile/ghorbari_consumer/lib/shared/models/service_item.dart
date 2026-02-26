class ServiceItem {
  final String id;
  final String name;
  final String? nameBn;
  final String? description;
  final String? descriptionBn;
  final String categoryId;
  final double unitPrice;
  final String unitType;
  final String? imageUrl;
  final String? providerId;
  final double rating;

  ServiceItem({
    required this.id,
    required this.name,
    this.nameBn,
    this.description,
    this.descriptionBn,
    required this.categoryId,
    required this.unitPrice,
    required this.unitType,
    this.imageUrl,
    this.providerId,
    this.rating = 4.5,
  });

  factory ServiceItem.fromJson(Map<String, dynamic> json) {
    return ServiceItem(
      id: json['id'],
      name: json['name'],
      nameBn: json['name_bn'],
      description: json['description'],
      descriptionBn: json['description_bn'],
      categoryId: json['category_id'],
      unitPrice: (json['unit_price'] ?? 0).toDouble(),
      unitType: json['unit_type'] ?? 'sqft',
      imageUrl: json['image_url'],
      providerId: json['provider_id'],
      rating: (json['rating'] ?? 4.5).toDouble(),
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
      'unit_price': unitPrice,
      'unit_type': unitType,
      'image_url': imageUrl,
      'provider_id': providerId,
      'rating': rating,
    };
  }
}
