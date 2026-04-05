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
  final String? titleBn;
  final String? subtitle;
  final String? subtitleBn;
  final String? description;
  final String? descriptionBn;
  final String? image;
  final String? buttonText;
  final String? link;
  final String? overlayColor;

  const HeroSlide({
    required this.title,
    this.titleBn,
    this.subtitle,
    this.subtitleBn,
    this.description,
    this.descriptionBn,
    this.image,
    this.buttonText,
    this.link,
    this.overlayColor,
  });

  factory HeroSlide.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from(json);
    return HeroSlide(
      title: map['title']?.toString() ?? '',
      titleBn: map['titleBn']?.toString() ?? map['title_bn']?.toString(),
      subtitle: map['subtitle']?.toString(),
      subtitleBn: map['subtitleBn']?.toString() ?? map['subtitle_bn']?.toString(),
      description: map['description']?.toString(),
      descriptionBn: map['descriptionBn']?.toString() ?? map['description_bn']?.toString(),
      image: map['image']?.toString() ?? map['imageUrl']?.toString(),
      buttonText: map['buttonText']?.toString() ?? map['button_text']?.toString(),
      link: map['link']?.toString() ?? map['cta_link']?.toString(),
      overlayColor: map['overlay_color']?.toString() ?? map['color']?.toString(),
    );
  }

  @override
  List<Object?> get props => [
        title,
        titleBn,
        subtitle,
        subtitleBn,
        description,
        descriptionBn,
        image,
        buttonText,
        link,
        overlayColor
      ];
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
      categoryId: map['category_id']?.toString() ?? map['category_source']?.toString(),
      bgStyle: map['bg_style']?.toString(),
    );
  }

  @override
  List<Object?> get props => [id, title, categoryId, bgStyle];
}

class CMSPageLayoutItem extends Equatable {
  final String id;
  final String type;
  final String dataKey;
  final bool hidden;
  final String? title;

  const CMSPageLayoutItem({
    required this.id,
    required this.type,
    required this.dataKey,
    required this.hidden,
    this.title,
  });

  factory CMSPageLayoutItem.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from(json);
    return CMSPageLayoutItem(
      id: map['id']?.toString() ?? '',
      type: map['type']?.toString() ?? '',
      dataKey: map['data_key']?.toString() ?? '',
      hidden: map['hidden'] == true,
      title: map['title']?.toString(),
    );
  }

  @override
  List<Object?> get props => [id, type, dataKey, hidden, title];
}
