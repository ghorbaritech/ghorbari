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
    if (json == null) return const HeroData(title: '', slides: []);
    final map = Map<String, dynamic>.from(json is Map ? json : {});
    return HeroData(
      title: map['title']?.toString() ?? '',
      subtitle: map['subtitle']?.toString(),
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
    if (json == null) return const HeroSlide(title: '');
    final map = Map<String, dynamic>.from(json is Map ? json : {});
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
    if (json == null) return const CMSCategorySection(items: []);
    if (json is List) {
      return CMSCategorySection(
        items: json.map((i) => CMSCategoryItem.fromJson(i)).toList(),
      );
    }
    final map = Map<String, dynamic>.from(json is Map ? json : {});
    return CMSCategorySection(
      title: map['title']?.toString(),
      items: (map['items'] as List? ?? [])
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
    if (json == null) return const CMSCategoryItem(id: '', name: '');
    final map = Map<String, dynamic>.from(json is Map ? json : {});
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
    if (json == null) return const CMSProductSection(id: '', title: '');
    final map = Map<String, dynamic>.from(json is Map ? json : {});
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
    if (json == null) return const CMSPageLayoutItem(id: '', type: '', dataKey: '', hidden: true);
    final map = Map<String, dynamic>.from(json is Map ? json : {});
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

class SingleSliderData extends Equatable {
  final String title;
  final List<HeroSlide> items;

  const SingleSliderData({required this.title, required this.items});

  factory SingleSliderData.fromJson(dynamic json) {
    if (json == null) return const SingleSliderData(title: '', items: []);
    final map = Map<String, dynamic>.from(json is Map ? json : {});
    return SingleSliderData(
      title: map['title']?.toString() ?? '',
      items: (map['items'] as List? ?? [])
          .map((i) => HeroSlide.fromJson(i))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [title, items];
}

class MovingIconData extends Equatable {
  final String title;
  final List<CMSCategoryItem> items;

  const MovingIconData({required this.title, required this.items});

  factory MovingIconData.fromJson(dynamic json) {
    if (json == null) return const MovingIconData(title: '', items: []);
    if (json is List) {
      return MovingIconData(
        title: '',
        items: json.map((i) => CMSCategoryItem.fromJson(i)).toList(),
      );
    }
    final map = Map<String, dynamic>.from(json is Map ? json : {});
    return MovingIconData(
      title: map['title']?.toString() ?? '',
      items: (map['items'] as List? ?? [])
          .map((i) => CMSCategoryItem.fromJson(i))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [title, items];
}

class InfoCardData extends Equatable {
  final String title;
  final List<InfoCardItem> items;

  const InfoCardData({required this.title, required this.items});

  factory InfoCardData.fromJson(dynamic json) {
    if (json == null) return const InfoCardData(title: '', items: []);
    final map = Map<String, dynamic>.from(json is Map ? json : {});
    return InfoCardData(
      title: map['title']?.toString() ?? '',
      items: (map['items'] as List? ?? [])
          .map((i) => InfoCardItem.fromJson(i))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [title, items];
}

class InfoCardItem extends Equatable {
  final String label;
  final String? subtitle;
  final String? icon;

  const InfoCardItem({required this.label, this.subtitle, this.icon});

  factory InfoCardItem.fromJson(dynamic json) {
    if (json == null) return const InfoCardItem(label: '');
    final map = Map<String, dynamic>.from(json is Map ? json : {});
    return InfoCardItem(
      label: map['label']?.toString() ?? '',
      subtitle: map['subtitle']?.toString(),
      icon: map['icon']?.toString(),
    );
  }

  @override
  List<Object?> get props => [label, subtitle, icon];
}

class BlogData extends Equatable {
  final String title;
  final List<BlogItem> items;

  const BlogData({required this.title, required this.items});

  factory BlogData.fromJson(dynamic json) {
    if (json == null) return const BlogData(title: '', items: []);
    final map = Map<String, dynamic>.from(json is Map ? json : {});
    return BlogData(
      title: map['title']?.toString() ?? '',
      items: (map['items'] as List? ?? [])
          .map((i) => BlogItem.fromJson(i))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [title, items];
}

class BlogItem extends Equatable {
  final String title;
  final String? subtitle;
  final String? image;
  final String? date;
  final String? link;

  const BlogItem({required this.title, this.subtitle, this.image, this.date, this.link});

  factory BlogItem.fromJson(dynamic json) {
    if (json == null) return const BlogItem(title: '');
    final map = Map<String, dynamic>.from(json is Map ? json : {});
    return BlogItem(
      title: map['title']?.toString() ?? '',
      subtitle: map['subtitle']?.toString(),
      image: map['image']?.toString() ?? map['image_url']?.toString(),
      date: map['date']?.toString(),
      link: map['link']?.toString(),
    );
  }

  @override
  List<Object?> get props => [title, subtitle, image, date, link];
}

class TestimonialData extends Equatable {
  final String title;
  final List<TestimonialItem> items;

  const TestimonialData({required this.title, required this.items});

  factory TestimonialData.fromJson(dynamic json) {
    if (json == null) return const TestimonialData(title: '', items: []);
    final map = Map<String, dynamic>.from(json is Map ? json : {});
    return TestimonialData(
      title: map['title']?.toString() ?? '',
      items: (map['items'] as List? ?? [])
          .map((i) => TestimonialItem.fromJson(i))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [title, items];
}

class TestimonialItem extends Equatable {
  final String name;
  final String? role;
  final String content;
  final String? avatar;

  const TestimonialItem({required this.name, this.role, required this.content, this.avatar});

  factory TestimonialItem.fromJson(dynamic json) {
    if (json == null) return const TestimonialItem(name: '', content: '');
    final map = Map<String, dynamic>.from(json is Map ? json : {});
    return TestimonialItem(
      name: map['name']?.toString() ?? '',
      role: map['role']?.toString(),
      content: map['content']?.toString() ?? '',
      avatar: map['avatar']?.toString() ?? map['image_url']?.toString(),
    );
  }

  @override
  List<Object?> get props => [name, role, content, avatar];
}
