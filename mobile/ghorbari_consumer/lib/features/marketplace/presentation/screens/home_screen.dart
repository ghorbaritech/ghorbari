import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:Dalankotha_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:Dalankotha_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/bloc/marketplace_bloc.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/bloc/marketplace_event.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/bloc/marketplace_state.dart';
import 'package:Dalankotha_consumer/shared/models/cms_content.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:Dalankotha_consumer/core/utils/image_utils.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/widgets/product_card.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/product_details_screen.dart';
import 'package:Dalankotha_consumer/shared/models/product.dart';
import 'package:Dalankotha_consumer/features/services/presentation/widgets/service_card.dart';
import 'package:Dalankotha_consumer/features/bookings/presentation/screens/booking_screen.dart';
import 'package:Dalankotha_consumer/features/design/presentation/screens/design_booking_wizard_screen.dart';
import 'package:Dalankotha_consumer/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:Dalankotha_consumer/features/cart/presentation/bloc/cart_state.dart';
import 'package:Dalankotha_consumer/features/cart/presentation/screens/cart_screen.dart';
import 'package:Dalankotha_consumer/shared/models/category.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:Dalankotha_consumer/core/utils/category_icon_helper.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/category_listing_screen.dart';
import 'package:Dalankotha_consumer/shared/models/service_item.dart';
import 'package:Dalankotha_consumer/core/utils/location_service.dart';
import 'package:Dalankotha_consumer/shared/widgets/ai_assistant_widget.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/search_screen.dart';

class HomeScreen extends StatefulWidget {
  final Function(int)? onNavigateToTab;

  const HomeScreen({super.key, this.onNavigateToTab});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final LocationService _locationService = LocationService();
  String _locationName = 'select_location'.tr();
  bool _isLocating = false;

  @override
  void initState() {
    super.initState();
    context.read<MarketplaceBloc>().add(MarketplaceFetchCMSContent());
    context.read<MarketplaceBloc>().add(MarketplaceFetchCategories());
    context.read<MarketplaceBloc>().add(const MarketplaceFetchProducts());
    _requestLocation();
  }

  Future<void> _requestLocation() async {
    setState(() => _isLocating = true);
    final location = await _locationService.getCurrentLocationName();
    if (mounted) {
      setState(() {
        _locationName = location;
        _isLocating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MarketplaceBloc, MarketplaceState>(
      builder: (context, state) {
        return Scaffold(
          backgroundColor: Colors.white,
          body: Stack(
            children: [
              CustomScrollView(
                slivers: [
                  _buildSliverAppBar(context),
                  _buildDynamicCMSContentFromState(context, state),
                  const SliverToBoxAdapter(child: SizedBox(height: 100)),
                ],
              ),
              AIAssistantWidget(),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDynamicCMSContentFromState(BuildContext context, MarketplaceState state) {
    if (state.cmsStatus == MarketplaceStatus.loading && state.cmsContent.isEmpty) {
      return const SliverToBoxAdapter(child: Center(child: Padding(padding: EdgeInsets.all(40.0), child: CircularProgressIndicator())));
    }
    if (state.cmsStatus != MarketplaceStatus.loaded) return const SliverToBoxAdapter(child: SizedBox.shrink());

    final content = state.cmsContent.data;
    if (content.isEmpty) return const SliverToBoxAdapter(child: Center(child: Padding(padding: EdgeInsets.all(20), child: Text('No CMS Content found'))));

    List<CMSPageLayoutItem> layout = [];
    if (content['page_layout'] is List) {
      layout = (content['page_layout'] as List).map((i) => CMSPageLayoutItem.fromJson(i)).toList();
    } else {
      layout = [
        const CMSPageLayoutItem(id: '1', type: 'HeroSlider', dataKey: 'hero_section', hidden: false),
        const CMSPageLayoutItem(id: '2', type: 'IconSlider', dataKey: 'featured_categories', hidden: false),
        const CMSPageLayoutItem(id: '3', type: 'DesignServices', dataKey: 'design_display_config', hidden: false),
        const CMSPageLayoutItem(id: '4', type: 'PromoBanners', dataKey: 'promo_banners', hidden: false),
      ];
    }

    String resolveUrl(String? path) => ImageUtils.resolveUrl(path);

    List<Widget> sections = [];
    for (var item in layout) {
      if (item.hidden) continue;
      switch (item.type) {
        case 'HeroSlider': case 'HeroContainer':
          if (content[item.dataKey] != null) sections.add(Padding(padding: const EdgeInsets.only(bottom: 32), child: _buildHeroSlider(content[item.dataKey], resolveUrl)));
          break;
        case 'IconSlider':
          if (content[item.dataKey] != null) sections.add(Padding(padding: const EdgeInsets.only(bottom: 32), child: _buildFeaturedCategories(CMSCategorySection.fromJson(content[item.dataKey]))));
          break;
        case 'DesignServices':
          if (content[item.dataKey] != null) sections.add(Padding(padding: const EdgeInsets.only(bottom: 32), child: _buildDesignServicesSection(content[item.dataKey], state)));
          break;
        case 'PromoBanners': case 'ThreeSliderBanner':
          if (content[item.dataKey] != null) sections.add(Padding(padding: const EdgeInsets.only(bottom: 32), child: _buildPromoBanner(content[item.dataKey], resolveUrl)));
          break;
        case 'SingleSlider':
          if (content[item.dataKey] != null) sections.add(Padding(padding: const EdgeInsets.only(bottom: 32), child: _buildSingleSlider(content[item.dataKey], resolveUrl)));
          break;
        case 'MovingIconSlider':
          if (content[item.dataKey] != null) sections.add(Padding(padding: const EdgeInsets.only(bottom: 32), child: _buildMovingIconSlider(content[item.dataKey], resolveUrl)));
          break;
        case 'InfoCardSlider': case 'CardSlider':
          if (content[item.dataKey] != null) sections.add(Padding(padding: const EdgeInsets.only(bottom: 32), child: _buildInfoCardSlider(InfoCardData.fromJson(content[item.dataKey]))));
          break;
        case 'CategoryShowcase':
          dynamic secData;
          if (item.dataKey.startsWith('product_sections[')) {
            final idx = int.tryParse(item.dataKey.replaceAll(RegExp(r'[^0-9]'), ''));
            if (idx != null && content['product_sections'] is List && idx < (content['product_sections'] as List).length) secData = content['product_sections'][idx];
          } else { secData = content[item.dataKey]; }
          if (secData != null) sections.add(Padding(padding: const EdgeInsets.only(bottom: 32), child: _buildProductSection(CMSProductSection.fromJson(secData), state)));
          break;
        case 'ServiceShowcase':
          dynamic secData;
          if (item.dataKey.startsWith('service_sections[')) {
            final idx = int.tryParse(item.dataKey.replaceAll(RegExp(r'[^0-9]'), ''));
            if (idx != null && content['service_sections'] is List && idx < (content['service_sections'] as List).length) secData = content['service_sections'][idx];
          } else { secData = content[item.dataKey]; }
          if (secData != null) sections.add(Padding(padding: const EdgeInsets.only(bottom: 32), child: _buildServiceSection(CMSProductSection.fromJson(secData))));
          break;
        case 'BlogSlider':
          if (content[item.dataKey] != null) sections.add(Padding(padding: const EdgeInsets.only(bottom: 32), child: _buildBlogSection(BlogData.fromJson(content[item.dataKey]), resolveUrl)));
          break;
        case 'TestimonialSlider': case 'ReviewsSlider': case 'TestimonialSection':
          final tKey = content[item.dataKey] != null ? item.dataKey : 'testimonial_section';
          if (content[tKey] != null) sections.add(Padding(padding: const EdgeInsets.only(bottom: 32), child: _buildTestimonialSection(TestimonialData.fromJson(content[tKey]), resolveUrl)));
          break;
      }
    }
    return SliverList(delegate: SliverChildBuilderDelegate((context, index) => sections[index], childCount: sections.length));
  }

  Widget _buildSliverAppBar(BuildContext context) {
    return SliverAppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      pinned: true,
      centerTitle: false,
      leading: IconButton(
        icon: const Icon(Icons.menu_rounded, color: Color(0xFF0F172A)),
        onPressed: () => Scaffold.of(context).openDrawer(),
      ),
      title: Row(
        children: [
          Image.asset(
            'assets/images/dalankotha_logo_v3.png',
            height: 42,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) => const Text(
              'dalankotha',
              style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: InkWell(
              onTap: _requestLocation,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.location_on, size: 12, color: Colors.blue.shade700),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        _locationName,
                        style: const TextStyle(fontSize: 10, color: Color(0xFF475569), fontWeight: FontWeight.w500),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (_isLocating)
                      const Padding(
                        padding: EdgeInsets.only(left: 4),
                        child: SizedBox(
                          width: 8,
                          height: 8,
                          child: CircularProgressIndicator(strokeWidth: 1.5),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      actions: [
        IconButton(icon: const Icon(Icons.search, color: Color(0xFF0F172A)), onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => SearchScreen()))),
        IconButton(icon: const Icon(Icons.notifications_outlined, color: Color(0xFF0F172A)), onPressed: () {}),
        BlocBuilder<CartBloc, CartState>(builder: (context, state) => Stack(alignment: Alignment.center, children: [IconButton(icon: const Icon(Icons.shopping_cart_outlined, color: Color(0xFF0F172A)), onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CartScreen()))), if (state.items.isNotEmpty) Positioned(top: 8, right: 8, child: Container(padding: const EdgeInsets.all(4), decoration: const BoxDecoration(color: Color(0xFF2563EB), shape: BoxShape.circle), child: Text('${state.items.length}', style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold))))])),
        const SizedBox(width: 4),
      ],
    );
  }

  Widget _buildHeroSlider(dynamic rawHeroData, String Function(String?) resolveUrl) {
    if (rawHeroData == null) return const SizedBox.shrink();
    final hero = HeroData.fromJson(rawHeroData);
    final isBn = context.locale.languageCode == 'bn';
    return Container(
      height: 200, 
      margin: const EdgeInsets.only(top: 12, bottom: 20),
      child: CarouselSlider(
        options: CarouselOptions(
          height: 200, 
          viewportFraction: 0.92, 
          enlargeCenterPage: true, 
          autoPlay: true, 
          autoPlayInterval: const Duration(seconds: 6)
        ),
        items: hero.slides.map((slide) {
          final title = (isBn && slide.titleBn != null && slide.titleBn!.isNotEmpty) ? slide.titleBn! : slide.title;
          final subtitle = (isBn && slide.subtitleBn != null && slide.subtitleBn!.isNotEmpty) ? slide.subtitleBn! : slide.subtitle;
          
          Color bgColor = const Color(0xFF0F172A);
          final titleLower = title.toLowerCase();
          if (titleLower.contains('design') || titleLower.contains('স্থাপত্য')) {
            bgColor = const Color(0xFF16A34A); // Brand Green
          } else if (titleLower.contains('market') || titleLower.contains('নির্মাণ') || titleLower.contains('materials')) {
            bgColor = const Color(0xFFEA580C); // Brand Orange
          } else if (titleLower.contains('service') || titleLower.contains('প্রকৌশলী') || titleLower.contains('engine')) {
            bgColor = const Color(0xFF1E3A8A); // Brand Blue
          } else if (slide.overlayColor != null) {
            try {
              bgColor = Color(int.parse('FF${slide.overlayColor!.replaceAll('#', '')}', radix: 16));
            } catch (e) {}
          }

          final imageUrl = resolveUrl(slide.image);
          // Logging for debugging Hero resolution
          print('DEBUG: HERO IMAGE URL: $imageUrl');

          return Container(
            width: double.infinity,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              color: bgColor,
            ),
            clipBehavior: Clip.antiAlias,
            child: Row(
              children: [
                // Left Side: Text Content
                Expanded(
                  flex: 3,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 0, 20),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (subtitle != null && subtitle.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              subtitle.toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        const SizedBox(height: 12),
                        Text(
                          title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            height: 1.1,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            final link = slide.link?.toLowerCase() ?? '';
                            if (link.contains('design')) widget.onNavigateToTab?.call(1);
                            else if (link.contains('service')) widget.onNavigateToTab?.call(2);
                            else widget.onNavigateToTab?.call(3);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: bgColor,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            minimumSize: const Size(0, 36),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                            elevation: 0,
                          ),
                          child: Text(
                            isBn ? 'আরও জানুন' : 'Learn More',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Right Side: Image
                Expanded(
                  flex: 2,
                  child: Container(
                    padding: const EdgeInsets.all(12.0),
                    alignment: Alignment.center,
                    child: Builder(
                      builder: (context) {
                        // Priority 1: Use dynamic CMS image if available
                        if (slide.image != null && slide.image!.isNotEmpty) {
                          return kIsWeb 
                            ? Image.network(
                                imageUrl,
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) => _buildLocalHeroFallback(title),
                              )
                            : CachedNetworkImage(
                                imageUrl: imageUrl,
                                fit: BoxFit.contain,
                                errorWidget: (context, url, error) => _buildLocalHeroFallback(title),
                                placeholder: (context, url) => Center(child: CircularProgressIndicator(color: Colors.white.withOpacity(0.3), strokeWidth: 2)),
                              );
                        }
                        
                        // Priority 2: Local fallback
                        return _buildLocalHeroFallback(title);
                      }
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildLocalHeroFallback(String title) {
    final titleLower = title.toLowerCase();
    if (titleLower.contains('design') || titleLower.contains('স্থাপত্য')) {
      return Image.asset('assets/images/hero-design.png', fit: BoxFit.contain, errorBuilder: (_, __, ___) => const Icon(Icons.architecture, color: Colors.white24, size: 48));
    } else if (titleLower.contains('market') || titleLower.contains('নির্মাণ') || titleLower.contains('materials')) {
      return Image.asset('assets/images/hero-materials.png', fit: BoxFit.contain, errorBuilder: (_, __, ___) => const Icon(Icons.shopping_bag, color: Colors.white24, size: 48));
    } else {
      return Image.asset('assets/images/hero-services.png', fit: BoxFit.contain, errorBuilder: (_, __, ___) => const Icon(Icons.engineering, color: Colors.white24, size: 48));
    }
  }

  Widget _buildFeaturedCategories(CMSCategorySection section) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (section.title != null && section.title!.isNotEmpty) 
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), 
          child: Text(
            section.title!, 
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))
          )
        ),
      SizedBox(
        height: 120, 
        child: ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 12), 
          scrollDirection: Axis.horizontal, 
          itemCount: section.items.length, 
          itemBuilder: (context, index) { 
            final item = section.items[index]; 
            final isBn = context.locale.languageCode == 'bn'; 
            final displayName = (isBn && item.nameBn != null && item.nameBn!.isNotEmpty) ? item.nameBn! : item.name; 
            
            // Determine icon widget with better 3D-style fallbacks for categories
            Widget iconWidget;
            if (item.icon != null && item.icon!.isNotEmpty && (item.icon!.startsWith('http') || item.icon!.contains('/'))) {
              iconWidget = _buildIconOrImage(item.icon!, size: 40, label: item.name);
            } else {
              // Comprehensive fallback mapping for categories
              IconData catIcon = Icons.category_rounded;
              Color catColor = const Color(0xFF64748B);
              final n = item.name.toLowerCase();
              
              if (n.contains('cement') || n.contains('সিমেন্ট')) { 
                catIcon = Icons.view_in_ar_rounded; catColor = const Color(0xFF92400E); 
              } else if (n.contains('sand') || n.contains('বালি')) { 
                catIcon = Icons.auto_awesome_motion_rounded; catColor = const Color(0xFFD97706); 
              } else if (n.contains('brick') || n.contains('ইট')) { 
                catIcon = Icons.grid_view_rounded; catColor = const Color(0xFFB91C1C); 
              } else if (n.contains('stone') || n.contains('পাথর')) { 
                catIcon = Icons.landscape_rounded; catColor = const Color(0xFF475569); 
              } else if (n.contains('materials') || n.contains('সাজসজ্জা')) {
                catIcon = Icons.construction_rounded; catColor = const Color(0xFF0369A1);
              } else if (n.contains('service') || n.contains('পেশাদার')) {
                catIcon = Icons.handyman_rounded; catColor = const Color(0xFF15803D);
              }
              
              iconWidget = Icon(catIcon, color: catColor, size: 28);
            }

            return _buildCircularCategory(
              displayName, 
              iconWidget, 
              false, 
              () { 
                Navigator.push(context, MaterialPageRoute(builder: (context) => CategoryListingScreen(category: Category(id: item.id, name: item.name, slug: item.slug ?? '', type: 'product', level: 0)))); 
              }
            ); 
          }
        )
      ),
    ]);
  }

  Widget _buildDesignServicesSection(dynamic displayConfig, MarketplaceState state) {
    final enrichedItems = displayConfig != null && displayConfig['items'] is List ? (displayConfig['items'] as List).map((i) { final map = Map<String, dynamic>.from(i); return Category(id: map['id']?.toString() ?? '', name: map['name']?.toString() ?? '', nameBn: map['name_bn']?.toString(), icon: map['icon']?.toString(), type: map['type']?.toString() ?? 'design', slug: map['slug']?.toString() ?? '', level: 2); }).toList() : <Category>[];
    final displayItems = enrichedItems.isNotEmpty ? enrichedItems : state.categories.where((c) => c.type == 'design' && c.level >= 2).toList();
    if (displayItems.isEmpty) return const SizedBox.shrink();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Padding(padding: EdgeInsets.fromLTRB(16, 24, 16, 12), child: Text('Design & Planning', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)))),
      SizedBox(height: 300, child: ListView.builder(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 12), itemCount: displayItems.length, itemBuilder: (context, index) => _buildDesignCard(displayItems[index]))),
    ]);
  }

  Widget _buildDesignCard(Category cat) {
    return Container(
      width: 200, margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))], border: Border.all(color: Colors.grey.shade100)), clipBehavior: Clip.antiAlias,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Stack(children: [CachedNetworkImage(imageUrl: ImageUtils.resolveUrl(cat.icon ?? ''), height: 140, width: double.infinity, fit: BoxFit.cover, errorWidget: (context, url, error) => Container(color: Colors.grey.shade200, child: const Center(child: Icon(Icons.design_services, color: Colors.grey)))), Positioned(top: 8, right: 8, child: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.white.withOpacity(0.9), borderRadius: BorderRadius.circular(20)), child: const Row(children: [Icon(Icons.star, color: Colors.amber, size: 14), SizedBox(width: 2), Text('4.8', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))])))]),
        Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(cat.nameBn ?? cat.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)), maxLines: 2, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 8), Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('৳১৬০০', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))), ElevatedButton(onPressed: () { final name = cat.name.toLowerCase(); final isStructural = name.contains('structur') || name.contains('architectur') || name.contains('build') || name.contains('plan'); Navigator.push(context, MaterialPageRoute(builder: (context) => DesignBookingWizardScreen(initialService: isStructural ? 'structural-architectural' : 'interior'))); }, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white, minimumSize: const Size(0, 32), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))), child: const Text('বুকিং দিন', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)))])
        ]))
      ]),
    );
  }

  Widget _buildServiceSection(CMSProductSection section) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.fromLTRB(16, 24, 16, 12), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(section.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))), TextButton(onPressed: () {}, child: Text('see_all'.tr()))])),
      _buildServiceSubcategoryList(section),
    ]);
  }

  Widget _buildServiceSubcategoryList(CMSProductSection section) {
    return BlocBuilder<MarketplaceBloc, MarketplaceState>(builder: (context, state) {
      final categorySource = section.categoryId;
      Category? parentCat;
      if (categorySource != null) { try { parentCat = state.categories.cast<Category>().firstWhere((c) => c.id == categorySource || c.name.toLowerCase() == categorySource.toLowerCase()); } catch (e) {} }
      if (parentCat == null) return const SizedBox.shrink();
      final subcategories = state.categories.cast<Category>().where((c) => c.parentId == parentCat!.id && c.type == 'service').toList();
      if (subcategories.isEmpty) return const SizedBox(height: 200, child: Center(child: Text('Service categories unavailable.')));
      final serviceItems = subcategories.map((cat) => ServiceItem(
        id: cat.id, 
        name: cat.nameBn ?? cat.name, 
        categoryId: parentCat!.id, 
        unitPrice: (cat.metadata?['price'] ?? 0).toDouble(), 
        unitType: cat.metadata?['unit'] ?? 'hr', 
        imageUrl: ImageUtils.resolveUrl(cat.icon ?? ''),
        rating: 4.8, 
        description: cat.nameBn ?? cat.name
      )).toList();
      return SizedBox(height: 240, child: ListView.builder(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), itemCount: serviceItems.length, itemBuilder: (context, index) => ServiceCard(service: serviceItems[index], onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => BookingScreen(service: serviceItems[index]))))));
    });
  }

  Widget _buildPromoBanner(dynamic promoData, String Function(String?) resolveUrl) {
    if (promoData == null) return const SizedBox.shrink();
    List<dynamic> rawItems = (promoData is List) ? promoData : (promoData is Map && promoData['items'] is List ? promoData['items'] : []);
    if (rawItems.isEmpty) return const SizedBox.shrink();
    final banners = rawItems.map((i) => HeroSlide.fromJson(i)).toList();
    final isBn = context.locale.languageCode == 'bn';
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.fromLTRB(16, 24, 16, 16), child: Text('our_current_deals'.tr(), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)))),
      SizedBox(
        height: 180, 
        child: ListView.builder(
          scrollDirection: Axis.horizontal, 
          padding: const EdgeInsets.symmetric(horizontal: 16), 
          itemCount: banners.length, 
          itemBuilder: (context, index) {
            final banner = banners[index];
            final bannerUrl = resolveUrl(banner.image);
            return GestureDetector(
              onTap: () { 
                final link = banner.link?.toLowerCase() ?? ''; 
                if (link.contains('design')) widget.onNavigateToTab?.call(1); 
                else if (link.contains('service')) widget.onNavigateToTab?.call(2); 
                else widget.onNavigateToTab?.call(3); 
              }, 
              child: Container(
                width: MediaQuery.of(context).size.width * 0.85, 
                margin: const EdgeInsets.only(right: 16), 
                decoration: BoxDecoration(
                  color: Colors.grey.shade100, 
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))]
                ), 
                clipBehavior: Clip.antiAlias,
                child: kIsWeb 
                  ? Image.network(bannerUrl, fit: BoxFit.cover, errorBuilder: (c, e, s) => const Center(child: Icon(Icons.image_outlined, color: Colors.grey))) 
                  : CachedNetworkImage(imageUrl: bannerUrl, fit: BoxFit.cover, errorWidget: (c, u, e) => const Center(child: Icon(Icons.image_outlined, color: Colors.grey))),
              ),
            );
          }
        )
      ),
    ]);
  }

  Widget _buildSingleSlider(dynamic rawData, String Function(String?) resolveUrl) {
    if (rawData == null) return const SizedBox.shrink();
    final data = SingleSliderData.fromJson(rawData);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (data.title.isNotEmpty) Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), child: Text(data.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900))),
      SizedBox(height: 160, child: ListView.builder(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), itemCount: data.items.length, itemBuilder: (context, index) { final banner = data.items[index]; return Container(width: 320, margin: const EdgeInsets.only(right: 12), decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), color: const Color(0xFFF1F5F9)), clipBehavior: Clip.antiAlias, child: Stack(children: [if (banner.image != null) Positioned.fill(child: kIsWeb ? Image.network(resolveUrl(banner.image), fit: BoxFit.cover, errorBuilder: (c, e, s) => Container(color: Colors.grey.shade100)) : CachedNetworkImage(imageUrl: resolveUrl(banner.image), fit: BoxFit.cover, errorWidget: (c, u, e) => Container(color: Colors.grey.shade100))), Positioned(bottom: 0, left: 0, right: 0, child: Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(gradient: LinearGradient(begin: Alignment.bottomCenter, end: Alignment.topCenter, colors: [Colors.black.withOpacity(0.8), Colors.transparent])), child: Text(banner.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))))])); })),
    ]);
  }

  Widget _buildMovingIconSlider(dynamic rawData, String Function(String?) resolveUrl) {
    if (rawData == null) return const SizedBox.shrink();
    final data = MovingIconData.fromJson(rawData);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (data.title.isNotEmpty) Padding(padding: const EdgeInsets.fromLTRB(16, 24, 16, 16), child: Text(data.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8)))),
      SizedBox(height: 60, child: ListView.builder(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), itemCount: data.items.length, itemBuilder: (context, index) { final item = data.items[index]; return Container(margin: const EdgeInsets.only(right: 32), child: Opacity(opacity: 0.6, child: item.icon != null ? (kIsWeb ? Image.network(resolveUrl(item.icon), height: 30, width: 100, fit: BoxFit.contain, errorBuilder: (c, e, s) => const SizedBox.shrink()) : CachedNetworkImage(imageUrl: resolveUrl(item.icon), height: 30, width: 100, fit: BoxFit.contain, errorWidget: (c, u, e) => const SizedBox.shrink())) : const SizedBox.shrink())); })),
    ]);
  }

  Widget _buildInfoCardSlider(InfoCardData data) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40),
      color: const Color(0xFF0F172A), // Match the dark background from web reference
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              data.title, 
              style: const TextStyle(
                color: Colors.white, 
                fontSize: 24, 
                fontWeight: FontWeight.bold
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            height: 160,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: data.items.length,
              itemBuilder: (context, index) {
                final item = data.items[index];
                return Container(
                  width: 140,
                  margin: const EdgeInsets.only(right: 16),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          shape: BoxShape.circle,
                        ),
                        child: item.icon != null && item.icon!.isNotEmpty
                            ? _buildIconOrImage(item.icon!, label: item.label)
                            : _getFallbackIcon(item.label, size: 36),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        item.label, 
                        style: const TextStyle(
                          color: Colors.white, 
                          fontSize: 14, 
                          fontWeight: FontWeight.w600
                        ), 
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (item.subtitle != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(
                            item.subtitle!, 
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.6), 
                              fontSize: 11
                            ), 
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                    ]
                  )
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIconOrImage(String path, {double size = 36, String? label}) {
    final resolvedUrl = ImageUtils.resolveUrl(path);
    if (resolvedUrl.startsWith('http') || resolvedUrl.contains('/storage/') || resolvedUrl.contains('ghorbari.tech')) {
       return kIsWeb 
         ? Image.network(
             resolvedUrl,
             width: size,
             height: size,
             fit: BoxFit.contain,
             errorBuilder: (c, u, e) => _getFallbackIcon(label ?? '', size: size),
           )
         : CachedNetworkImage(
             imageUrl: resolvedUrl,
             width: size,
             height: size,
             fit: BoxFit.contain,
             errorWidget: (c, u, e) => _getFallbackIcon(label ?? '', size: size),
           );
    }
    return _getFallbackIcon(label ?? '', size: size);
  }

  Widget _getFallbackIcon(String label, {double size = 36}) {
    final l = label.toLowerCase();
    IconData icon = Icons.verified_user_outlined;
    Color color = Colors.blue.shade400;

    if (l.contains('verified') || l.contains('সদস্য')) {
      icon = Icons.verified_user;
      color = Colors.blue.shade600;
    } else if (l.contains('support') || l.contains('সহায়তা')) {
      icon = Icons.headset_mic;
      color = Colors.green.shade600;
    } else if (l.contains('secure') || l.contains('নিরাপদ')) {
      icon = Icons.security;
      color = Colors.orange.shade600;
    } else if (l.contains('quality') || l.contains('মান')) {
      icon = Icons.star_rounded;
      color = Colors.amber.shade600;
    } else if (l.contains('plan') || l.contains('expert') || l.contains('পরিকল্পনা')) {
      icon = Icons.engineering;
      color = Colors.indigo.shade600;
    } else if (l.contains('price') || l.contains('মূল্য')) {
      icon = Icons.attach_money;
      color = Colors.teal.shade600;
    } else if (l.contains('cement') || l.contains('সিমেন্ট')) {
      icon = Icons.view_in_ar_rounded;
      color = const Color(0xFF92400E);
    } else if (l.contains('sand') || l.contains('বালি')) {
      icon = Icons.auto_awesome_motion_rounded;
      color = const Color(0xFFD97706);
    } else if (l.contains('brick') || l.contains('ইট')) {
      icon = Icons.grid_view_rounded;
      color = const Color(0xFFB91C1C);
    } else if (l.contains('stone') || l.contains('পাথর')) {
      icon = Icons.landscape_rounded;
      color = const Color(0xFF475569);
    } else if (l.contains('design') || l.contains('স্থাপত্য')) {
      icon = Icons.palette_rounded;
      color = const Color(0xFF15803D);
    }
    
    return Icon(icon, color: color, size: size);
  }

  Widget _buildProductSection(CMSProductSection section, MarketplaceState state) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.fromLTRB(16, 24, 16, 12), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(section.title ?? 'Products', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))), TextButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const SearchScreen())), child: Text('see_all'.tr()))])),
      _buildProductsHorizontalList(section, state),
    ]);
  }

  Widget _buildProductsHorizontalList(CMSProductSection section, MarketplaceState state) {
    final categorySource = section.categoryId;
    Category? parentCat;
    if (categorySource != null) { try { parentCat = state.categories.cast<Category>().firstWhere((c) => c.id == categorySource || c.name.toLowerCase() == categorySource.toLowerCase()); } catch (e) {} }
    if (parentCat == null) return const SizedBox.shrink();
    final Set<String> targetIdsSet = {parentCat.id};
    void addChildren(String pid) { for (var cid in state.categories.where((c) => c.parentId == pid).map((c) => c.id)) { if (targetIdsSet.add(cid)) addChildren(cid); } }
    addChildren(parentCat.id);
    final products = state.products.where((p) => targetIdsSet.contains(p.categoryId)).toList();
    if (products.isEmpty) return const SizedBox.shrink();
    return SizedBox(height: 240, child: ListView.builder(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), itemCount: products.length, itemBuilder: (context, index) => Padding(padding: const EdgeInsets.only(right: 12), child: SizedBox(width: 160, child: ProductCard(product: products[index], onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => ProductDetailsScreen(product: products[index]))))))));
  }

  Widget _buildCircularCategory(String name, Widget icon, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 80, margin: const EdgeInsets.symmetric(horizontal: 4),
        child: Column(
          children: [
            Container(
              height: 64, width: 64, 
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFFF97316).withOpacity(0.05) : Colors.white, 
                shape: BoxShape.circle, 
                border: Border.all(color: isSelected ? const Color(0xFFF97316) : Colors.grey.withOpacity(0.2), width: 1)
              ), 
              child: Center(child: icon)
            ), 
            const SizedBox(height: 8), 
            Text(
              name, 
              maxLines: 1, 
              overflow: TextOverflow.ellipsis, 
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11, 
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.w500, 
                color: isSelected ? const Color(0xFFF97316) : const Color(0xFF475569)
              )
            )
          ]
        ),
      ),
    );
  }

  Widget _buildBlogSection(BlogData data, String Function(String?) resolveUrl) {
    if (data.items.isEmpty) return const SizedBox.shrink();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.fromLTRB(16, 24, 16, 16), child: Text(data.title.isNotEmpty ? data.title : 'Our Latest Blogs', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)))),
      SizedBox(height: 250, child: ListView.builder(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), itemCount: data.items.length, itemBuilder: (context, index) {
        final item = data.items[index];
        return Container(
          width: 220, margin: const EdgeInsets.only(right: 16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))]), clipBehavior: Clip.antiAlias,
          child: Column(children: [
            Expanded(child: item.image != null ? (kIsWeb ? Image.network(resolveUrl(item.image), fit: BoxFit.cover, width: double.infinity, errorBuilder: (c, e, s) => Container(color: Colors.grey.shade100, child: const Center(child: Icon(Icons.article_outlined, color: Colors.grey)))) : CachedNetworkImage(imageUrl: resolveUrl(item.image), fit: BoxFit.cover, width: double.infinity, errorWidget: (c, u, e) => Container(color: Colors.grey.shade100, child: const Center(child: Icon(Icons.article_outlined, color: Colors.grey))))) : Container(color: Colors.grey.shade100, child: const Center(child: Icon(Icons.article_outlined, color: Colors.grey)))),
            Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [if (item.date != null) Text(item.date!, style: TextStyle(color: Colors.grey.shade500, fontSize: 10)), Text(item.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)), maxLines: 2, overflow: TextOverflow.ellipsis)]))
          ]),
        );
      })),
    ]);
  }

  Widget _buildTestimonialSection(TestimonialData data, String Function(String?) resolveUrl) {
    if (data.items.isEmpty) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 24), padding: const EdgeInsets.symmetric(vertical: 40), color: Colors.grey.shade50,
      child: Column(children: [
        Padding(padding: const EdgeInsets.only(bottom: 32), child: Text(data.title.isNotEmpty ? data.title : 'Customer Reviews', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900))),
        SizedBox(height: 200, child: PageView.builder(controller: PageController(viewportFraction: 0.85), itemCount: data.items.length, itemBuilder: (context, index) {
          final item = data.items[index];
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 8), padding: const EdgeInsets.all(24), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)]),
            child: Column(children: [
              const Icon(Icons.format_quote, color: Color(0xFFF97316), size: 32),
              Expanded(child: Text(item.content, style: const TextStyle(fontSize: 13, height: 1.5, fontStyle: FontStyle.italic, color: Color(0xFF475569)), textAlign: TextAlign.center, maxLines: 4, overflow: TextOverflow.ellipsis)),
              const SizedBox(height: 16),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                if (item.avatar != null) CircleAvatar(radius: 16, backgroundImage: (kIsWeb ? NetworkImage(resolveUrl(item.avatar)) : CachedNetworkImageProvider(resolveUrl(item.avatar))) as ImageProvider),
                const SizedBox(width: 8), Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(item.name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)), if (item.role != null) Text(item.role!, style: TextStyle(fontSize: 10, color: Colors.grey.shade500))])
              ])
            ]),
          );
        })),
      ]),
    );
  }
}
