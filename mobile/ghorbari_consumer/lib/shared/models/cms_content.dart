import 'package:equatable/equatable.dart';

class CMSContent extends Equatable {
  final Map<String, dynamic> data;

  const CMSContent(this.data);

  @override
  List<Object?> get props => [data];

  dynamic operator [](String key) => data[key];

  bool get isEmpty => data.isEmpty;
  bool get isNotEmpty => data.isNotEmpty;
}

class HeroData extends Equatable {
  final String title;
  final String? subtitle;
  final List<HeroSlide> slides;

  const HeroData({
    required this.title,
    this.subtitle,
    required this.slides,
  });

  factory HeroData.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from(json);
    return HeroData(
      title: map['title'] ?? '',
      subtitle: map['subtitle'],
      slides: (map['items'] as List? ?? [])
          .map((i) => HeroSlide.fromJson(i))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [title, subtitle, slides];
}

class HeroSlide extends Equatable {
  final String title;
  final String? description;
  final String? image;
  final String? buttonText;
  final String? link;

  const HeroSlide({
    required this.title,
    this.description,
    this.image,
    this.buttonText,
    this.link,
  });

  factory HeroSlide.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from(json);
    return HeroSlide(
      title: map['title'] ?? '',
      description: map['description'],
      image: map['image'] ?? map['imageUrl'],
      buttonText: map['buttonText'] ?? map['button_text'],
      link: map['link'] ?? map['cta_link'],
    );
  }

  @override
  List<Object?> get props => [title, description, image, buttonText, link];
}

class CMSCategorySection extends Equatable {
  final String? title;
  final List<CMSCategoryItem> items;

  const CMSCategorySection({this.title, required this.items});

  factory CMSCategorySection.fromJson(dynamic json) {
    if (json is List) {
      return CMSCategorySection(
        items: json.map((i) => CMSCategoryItem.fromJson(i)).toList(),
      );
    }
    return CMSCategorySection(
      title: json['title'],
      items: (json['items'] as List? ?? [])
          .map((i) => CMSCategoryItem.fromJson(i))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [title, items];
}

class CMSCategoryItem extends Equatable {
  final String id;
  final String name;
  final String? nameBn;
  final String? icon;
  final String? slug;

  const CMSCategoryItem({
    required this.id,
    required this.name,
    this.nameBn,
    this.icon,
    this.slug,
  });

  factory CMSCategoryItem.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from(json);
    return CMSCategoryItem(
      id: map['id']?.toString() ?? '',
      name: map['name']?.toString() ?? '',
      nameBn: map['name_bn']?.toString(),
      icon: map['icon']?.toString(),
      slug: map['slug']?.toString(),
    );
  }

  @override
  List<Object?> get props => [id, name, nameBn, icon, slug];
}

class CMSProductSection extends Equatable {
  final String id;
  final String title;
  final String? categoryId;
  final String? bgStyle;

  const CMSProductSection({
    required this.id,
    required this.title,
    this.categoryId,
    this.bgStyle,
  });

  factory CMSProductSection.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from(json);
    return CMSProductSection(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      categoryId: map['category_id']?.toString(),
      bgStyle: map['bg_style']?.toString(),
    );
  }

  @override
  List<Object?> get props => [id, title, categoryId, bgStyle];
}
