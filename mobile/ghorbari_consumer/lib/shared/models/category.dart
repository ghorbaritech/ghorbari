class Category {
  final String id;
  final String name;
  final String? nameBn;
  final String slug;
  final String? icon;
  final String type; // product, service, design
  final int level;
  final String? parentId;

  Category({
    required this.id,
    required this.name,
    this.nameBn,
    required this.slug,
    this.icon,
    required this.type,
    required this.level,
    this.parentId,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Uncategorized',
      nameBn: json['name_bn']?.toString(),
      slug: json['slug']?.toString() ?? '',
      icon: json['icon']?.toString(),
      type: json['type']?.toString() ?? 'product',
      level: (json['level'] ?? 0) is int ? json['level'] : int.tryParse(json['level']?.toString() ?? '0') ?? 0,
      parentId: json['parent_id']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'name_bn': nameBn,
      'slug': slug,
      'icon': icon,
      'type': type,
      'level': level,
      'parent_id': parentId,
    };
  }
}
