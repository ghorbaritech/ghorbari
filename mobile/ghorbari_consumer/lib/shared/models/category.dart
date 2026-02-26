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
      id: json['id'],
      name: json['name'],
      nameBn: json['name_bn'],
      slug: json['slug'],
      icon: json['icon'],
      type: json['type'] ?? 'product',
      level: json['level'] ?? 0,
      parentId: json['parent_id'],
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
