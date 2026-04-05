import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_bloc.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_event.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_state.dart';
import 'package:ghorbari_consumer/shared/models/cms_content.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/widgets/product_card.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/product_details_screen.dart';
import 'package:ghorbari_consumer/shared/models/product.dart';
import 'package:ghorbari_consumer/features/services/presentation/bloc/service_bloc.dart';
import 'package:ghorbari_consumer/features/services/presentation/bloc/service_event.dart';
import 'package:ghorbari_consumer/features/services/presentation/bloc/service_state.dart';
import 'package:ghorbari_consumer/features/services/presentation/widgets/service_card.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/screens/booking_screen.dart';
import 'package:ghorbari_consumer/features/design/presentation/screens/design_booking_wizard_screen.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/screens/my_bookings_screen.dart';
import 'package:ghorbari_consumer/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ghorbari_consumer/features/cart/presentation/bloc/cart_state.dart';
import 'package:ghorbari_consumer/features/cart/presentation/screens/cart_screen.dart';
import 'package:ghorbari_consumer/shared/models/category.dart';
import 'package:ghorbari_consumer/shared/widgets/shimmer_loading.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:ghorbari_consumer/core/utils/category_icon_helper.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/category_listing_screen.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/service_listing_screen.dart';
import 'package:pointer_interceptor/pointer_interceptor.dart';
import 'package:ghorbari_consumer/shared/models/service_item.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:ghorbari_consumer/core/utils/location_service.dart';
import 'package:ghorbari_consumer/shared/widgets/ai_assistant_widget.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/search_screen.dart';

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

  Widget _buildDynamicCMSContentFromState(
      BuildContext context, MarketplaceState state) {
    if (state.cmsStatus == MarketplaceStatus.loading &&
        state.cmsContent.isEmpty) {
      return const SliverToBoxAdapter(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(40.0),
            child: CircularProgressIndicator(),
          ),
        ),
      );
    }

    if (state.cmsStatus != MarketplaceStatus.loaded) {
      return const SliverToBoxAdapter(child: SizedBox.shrink());
    }

    final content = state.cmsContent.data;
    if (content.isEmpty) {
      return const SliverToBoxAdapter(
          child: Center(
              child: Padding(
                  padding: EdgeInsets.all(20),
                  child: Text('No CMS Content found'))));
    }

    // Parse Layout
    List<CMSPageLayoutItem> layout = [];
    if (content['page_layout'] is List) {
      layout = (content['page_layout'] as List)
          .map((i) => CMSPageLayoutItem.fromJson(i))
          .toList();
    } else {
      // Fallback layout if missing
      layout = [
        const CMSPageLayoutItem(id: '1', type: 'HeroSlider', dataKey: 'hero_section', hidden: false),
        const CMSPageLayoutItem(id: '2', type: 'IconSlider', dataKey: 'featured_categories', hidden: false),
        const CMSPageLayoutItem(id: '3', type: 'DesignServices', dataKey: 'design_display_config', hidden: false),
        const CMSPageLayoutItem(id: '4', type: 'PromoBanners', dataKey: 'promo_banners', hidden: false),
      ];
      // Add product sections
      if (content['product_sections'] is List) {
        final pSecs = content['product_sections'] as List;
        for (int i = 0; i < pSecs.length; i++) {
          layout.add(CMSPageLayoutItem(id: 'p_$i', type: 'CategoryShowcase', dataKey: 'product_sections[$i]', hidden: false));
        }
      }
      // Add service sections
      if (content['service_sections'] is List) {
        final sSecs = content['service_sections'] as List;
        for (int i = 0; i < sSecs.length; i++) {
          layout.add(CMSPageLayoutItem(id: 's_$i', type: 'ServiceShowcase', dataKey: 'service_sections[$i]', hidden: false));
        }
      }
    }

    List<Widget> sections = [];
    for (var item in layout) {
      if (item.hidden) continue;

      switch (item.type) {
        case 'HeroSlider':
          sections.add(_buildHeroSlider(content[item.dataKey]));
          break;
        case 'IconSlider':
          if (content[item.dataKey] != null) {
            sections.add(_buildFeaturedCategories(CMSCategorySection.fromJson(content[item.dataKey])));
          }
          break;
        case 'DesignServices':
          sections.add(_buildDesignServicesSection(content[item.dataKey], state));
          break;
        case 'PromoBanners':
        case 'ThreeSliderBanner':
          if (content[item.dataKey] != null) {
            sections.add(_buildPromoBanner(content[item.dataKey]));
          }
          break;
        case 'CategoryShowcase':
          dynamic secData;
          if (item.dataKey.startsWith('product_sections[')) {
             final idx = int.tryParse(item.dataKey.replaceAll(RegExp(r'[^0-9]'), ''));
             if (idx != null && content['product_sections'] is List && idx < (content['product_sections'] as List).length) {
               secData = content['product_sections'][idx];
             }
          } else {
            secData = content[item.dataKey];
          }
          if (secData != null) {
            sections.add(_buildProductSection(CMSProductSection.fromJson(secData), state));
          }
          break;
        case 'ServiceShowcase':
        case 'ServiceShowcaseOld':
          dynamic secData;
          if (item.dataKey.startsWith('service_sections[')) {
             final idx = int.tryParse(item.dataKey.replaceAll(RegExp(r'[^0-9]'), ''));
             if (idx != null && content['service_sections'] is List && idx < (content['service_sections'] as List).length) {
               secData = content['service_sections'][idx];
             }
          } else {
            secData = content[item.dataKey];
          }
          if (secData != null) {
            sections.add(_buildServiceSection(CMSProductSection.fromJson(secData)));
          }
          break;
      }
    }

    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) => sections[index],
        childCount: sections.length,
      ),
    );
  }

  Widget _buildSliverAppBar(BuildContext context) {
    return SliverAppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      pinned: true,
      title: Row(
        children: [
          Image.asset(
            'assets/images/logo.png',
            height: 28,
            errorBuilder: (context, error, stackTrace) => const Text(
              'GHORBARI',
              style: TextStyle(
                  fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
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
                        style: const TextStyle(
                            fontSize: 10,
                            color: Color(0xFF475569),
                            fontWeight: FontWeight.w500),
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
        // 1. Search
        IconButton(
            icon: const Icon(Icons.search, color: Color(0xFF0F172A)),
            onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => SearchScreen()))),
        // 2. Notification Bell
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined, color: Color(0xFF0F172A)),
              onPressed: () {
                // TODO: Navigate to notifications screen
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Notifications coming soon!')),
                );
              },
            ),
            // Static badge — replace with real unread count later
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFFEF4444),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
        // 3. Cart
        BlocBuilder<CartBloc, CartState>(
          builder: (context, state) {
            return Stack(
              alignment: Alignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.shopping_cart_outlined,
                      color: Color(0xFF0F172A)),
                  onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const CartScreen())),
                ),
                if (state.items.isNotEmpty)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                          color: Color(0xFF2563EB), shape: BoxShape.circle),
                      child: Text('${state.items.length}',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 8,
                              fontWeight: FontWeight.bold)),
                    ),
                  ),
              ],
            );
          },
        ),
        const SizedBox(width: 4),
      ],
    );
  }

  Widget _buildHeroSlider(dynamic rawHeroData) {
    if (rawHeroData == null) return const SizedBox.shrink();

    final hero = HeroData.fromJson(rawHeroData);
    final isBn = context.locale.languageCode == 'bn';

    return Container(
      height: 180,
      margin: const EdgeInsets.only(top: 12, bottom: 32),
      child: CarouselSlider(
        options: CarouselOptions(
          height: 180,
          viewportFraction: 0.9,
          enlargeCenterPage: true,
          autoPlay: true,
          autoPlayInterval: const Duration(seconds: 5),
        ),
        items: hero.slides.map((slide) {
          final title = (isBn && slide.titleBn != null && slide.titleBn!.isNotEmpty) ? slide.titleBn! : slide.title;
          final subtitle = (isBn && slide.subtitleBn != null && slide.subtitleBn!.isNotEmpty) ? slide.subtitleBn! : slide.subtitle;
          final description = (isBn && slide.descriptionBn != null && slide.descriptionBn!.isNotEmpty) ? slide.descriptionBn! : (slide.description ?? '');

          Color bgColor = const Color(0xFF0F172A);
          if (slide.overlayColor != null) {
            try {
              final colorStr = slide.overlayColor!.replaceAll('#', '');
              bgColor = Color(int.parse('FF$colorStr', radix: 16));
            } catch (e) {
              // fallback
            }
          }

          return PointerInterceptor(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: bgColor,
              ),
              clipBehavior: Clip.antiAlias,
              child: Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 15),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (subtitle != null && subtitle.isNotEmpty)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                subtitle,
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                          const SizedBox(height: 8),
                          Flexible(
                            child: Text(
                              title,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  height: 1.2),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(height: 4),
                          if (description.isNotEmpty)
                            Flexible(
                              child: Text(
                                description,
                                style: TextStyle(
                                    color: Colors.white.withOpacity(0.9),
                                    fontSize: 11),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          const SizedBox(height: 12),
                          GestureDetector(
                            onTap: () {
                              final link = slide.link?.toLowerCase() ?? '';
                              if (link.contains('design')) {
                                widget.onNavigateToTab?.call(1);
                              } else if (link.contains('service')) {
                                widget.onNavigateToTab?.call(2);
                              } else if (link.contains('product')) {
                                widget.onNavigateToTab?.call(3);
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 6),
                              decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20)),
                              child: Text(
                                isBn ? 'আরও জানুন' : 'Learn More',
                                style: TextStyle(
                                    color: bgColor,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (slide.image != null)
                    Expanded(
                      flex: 2,
                      child: Hero(
                        tag: 'hero_image_${slide.title}',
                        child: slide.image!.startsWith('http')
                            ? CachedNetworkImage(imageUrl: slide.image!, fit: BoxFit.contain, alignment: Alignment.centerRight)
                            : Image.asset(
                                slide.image!.startsWith('/') ? 'assets/images${slide.image}' : slide.image!,
                                fit: BoxFit.contain,
                                alignment: Alignment.centerRight,
                                errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
                              ),
                      ),
                    ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildFeaturedCategories(CMSCategorySection section) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (section.title != null && section.title!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              section.title!,
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A)),
            ),
          ),
        SizedBox(
          height: 110,
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            scrollDirection: Axis.horizontal,
            itemCount: section.items.length,
            itemBuilder: (context, index) {
              final item = section.items[index];
              final isBn = context.locale.languageCode == 'bn';
              final displayName = (isBn && item.nameBn != null && item.nameBn!.isNotEmpty) ? item.nameBn! : item.name;
              return _buildCircularCategory(
                displayName,
                CategoryIconHelper.getIcon(item.name),
                false,
                () {
                  Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => CategoryListingScreen(
                              category: Category(
                                  id: item.id,
                                  name: item.name,
                                  slug: item.slug ?? '',
                                  type: 'product',
                                  level: 0))));
                },
              );
            },
          ),
        ),
      ],
    );
  }

    Widget _buildDesignServicesSection(dynamic displayConfig, MarketplaceState state) {
    // Get selected_ids from CMS design_display_config, fall back to all design items
    final selectedIds = displayConfig != null && displayConfig['selected_ids'] is List
        ? List<String>.from(displayConfig['selected_ids'] as List)
        : <String>[];

    // Get design categories from state (level >= 2 are the displayable items)
    final allDesignItems = state.categories
        .where((c) => c.type == 'design' && c.level >= 2)
        .toList();

    // Filter by selected IDs if CMS config exists
    final displayItems = selectedIds.isNotEmpty
        ? allDesignItems.where((c) => selectedIds.contains(c.id)).toList()
        : allDesignItems;

    if (displayItems.isEmpty) {
      // Fallback: show nothing if no design items are selected in CMS yet
      return const SizedBox.shrink();
    }

    final cardColors = [
      const Color(0xFF0F172A),
      const Color(0xFF14532D),
      const Color(0xFF78350F),
      const Color(0xFF1D4ED8),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Text(
            'Design & Planning',
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A)),
          ),
        ),
        SizedBox(
          height: 280,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: displayItems.length,
            itemBuilder: (context, index) {
              final cat = displayItems[index];
              return _buildDesignCard(cat);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDesignCard(Category cat) {
    return Container(
      width: 200,
      margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: Colors.grey.shade100),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image and Rating
          Stack(
            children: [
              CachedNetworkImage(
                imageUrl: cat.icon ?? '',
                height: 140,
                width: double.infinity,
                fit: BoxFit.cover,
                errorWidget: (context, url, error) => Container(
                  color: Colors.grey.shade200,
                  child: const Center(
                    child: Icon(Icons.design_services, color: Colors.grey),
                  ),
                ),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.star, color: Colors.amber, size: 14),
                      SizedBox(width: 2),
                      Text(
                        '4.8',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  cat.nameBn ?? cat.name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'শুরু',
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.grey.shade500,
                            ),
                          ),
                          const Text(
                            '৳১৬০০', // Placeholder for now or dynamic if available
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ],
                      ),
                      ElevatedButton(
                        onPressed: () {
                          // Route design items to the wizard
                          final name = cat.name.toLowerCase();
                          final isStructural = name.contains('structur') || name.contains('architectur') || name.contains('build') || name.contains('plan');
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => DesignBookingWizardScreen(
                                initialService: isStructural ? 'structural-architectural' : 'interior',
                              ),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F172A),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          minimumSize: const Size(0, 32),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: const Text(
                          'বুকিং দিন',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      );
  }


  Widget _buildServiceSection(CMSProductSection section) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(section.title, // NOTE: section title from CMS could be updated if CMS provides bilingual titles
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A))),
              TextButton(
                  onPressed: () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) =>
                                ServiceListingScreen(section: section)));
                  },
                  child: Text('see_all'.tr())),
            ],
          ),
        ),
        _buildServiceSubcategoryList(section),
      ],
    );
  }

  Widget _buildServiceSubcategoryList(CMSProductSection section) {
    final categorySource = section.categoryId;
    
    return BlocBuilder<MarketplaceBloc, MarketplaceState>(
      builder: (context, state) {
        if (state.productsStatus == MarketplaceStatus.loading) {
          return const SizedBox(
              height: 200, child: Center(child: CircularProgressIndicator()));
        }

        // 1. Find the Parent Category by ID or Name
        Category? parentCat;
        if (categorySource != null) {
          try {
            parentCat = state.categories.cast<Category>().firstWhere(
              (c) => c.id == categorySource || c.name.toLowerCase() == categorySource.toLowerCase(),
              orElse: () => state.categories.cast<Category>().firstWhere(
                (c) => c.name.toLowerCase().contains(categorySource.split(' ').first.toLowerCase()),
                orElse: () => state.categories.first, // Last ditch fallback if possible, but actually we want null if not found
              ),
            );
          } catch (e) {
            parentCat = null;
          }
        }

        // 2. Fetch all subcategories that belong to this Parent Category
        List<Category> subcategories = [];
        if (parentCat != null) {
          subcategories = state.categories.cast<Category>().where(
            (c) => c.parentId == parentCat!.id && c.type == 'service'
          ).toList();
        }

        if (subcategories.isEmpty) {
           return const SizedBox(
              height: 200, 
              child: Center(child: Text('Service categories unavailable.', style: TextStyle(color: Colors.grey)))
           );
        }

        // 3. Map Subcategories to ServiceItems to render in ServiceCard
        final serviceItems = subcategories.map((cat) {
            final price = (cat.metadata?['price'] ?? 0).toDouble();
            final unit = cat.metadata?['unit'] ?? 'hr';
            
            String? icon;
            final String webBaseUrl = kIsWeb ? 'https://ghorbari.tech' : 'https://ghorbari.tech';
            
            if (cat.icon != null && cat.icon!.isNotEmpty) {
              if (cat.icon!.startsWith('http')) {
                icon = cat.icon;
              } else if (cat.icon!.startsWith('/')) {
                // Category icons are hosted on the main Web platform
                icon = '$webBaseUrl${cat.icon}';
              } else {
                icon = Supabase.instance.client.storage
                    .from('public')
                    .getPublicUrl(cat.icon!);
              }
            } else if (cat.metadata?['image'] != null && cat.metadata!['image'].isNotEmpty) {
               final String metaImage = cat.metadata!['image'];
               if (metaImage.startsWith('http')) {
                  icon = metaImage;
               } else if (metaImage.startsWith('/')) {
                  icon = '$webBaseUrl$metaImage';
               } else {
                  icon = Supabase.instance.client.storage
                      .from('public')
                      .getPublicUrl(metaImage);
               }
            }

            final isBn = context.locale.languageCode == 'bn';
            final displayName = (isBn && cat.nameBn != null && cat.nameBn!.isNotEmpty) ? cat.nameBn! : cat.name;

            return ServiceItem(
              id: cat.id,
              name: displayName,
              categoryId: parentCat?.id ?? 'service',
              unitPrice: price,
              unitType: unit,
              imageUrl: icon ?? '',
              rating: 4.8, // Fallback rating
              description: isBn ? (cat.nameBn ?? 'Expert professional service') : 'Expert professional service',
            );
        }).toList();

        return SizedBox(
          height: 240,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: serviceItems.length,
            itemBuilder: (context, index) {
              return ServiceCard(
                service: serviceItems[index],
                onTap: () {
                   Navigator.push(
                     context,
                     MaterialPageRoute(
                       builder: (context) => BookingScreen(service: serviceItems[index])
                     ),
                   );
                },
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildPromoBanner(dynamic promoData) {
    if (promoData == null) return const SizedBox.shrink();

    List<dynamic> rawItems = [];
    if (promoData is List) {
      rawItems = promoData;
    } else if (promoData is Map && promoData['items'] is List) {
      rawItems = promoData['items'];
    }

    if (rawItems.isEmpty) return const SizedBox.shrink();

    final List<HeroSlide> banners = rawItems.map((i) => HeroSlide.fromJson(i)).toList();
    final isBn = context.locale.languageCode == 'bn';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Text(
            'our_current_deals'.tr(),
            style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                color: Colors.grey,
                letterSpacing: 1.2),
          ),
        ),
        SizedBox(
          height: 180,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: banners.length,
            itemBuilder: (context, index) {
              final banner = banners[index];
              final title = (isBn && banner.titleBn != null && banner.titleBn!.isNotEmpty) ? banner.titleBn! : banner.title;
              final subtitle = (isBn && banner.subtitleBn != null && banner.subtitleBn!.isNotEmpty) ? banner.subtitleBn! : banner.subtitle;
              final badge = (isBn && banner.descriptionBn != null && banner.descriptionBn!.isNotEmpty) ? banner.descriptionBn! : (banner.description ?? '');

              Color bgColor = const Color(0xFF0F172A);
              if (banner.overlayColor != null) {
                try {
                  final colorStr = banner.overlayColor!.replaceAll('#', '');
                  bgColor = Color(int.parse('FF$colorStr', radix: 16));
                } catch (e) {
                  // Fallback colors for variation
                  final colors = [const Color(0xFF0F172A), const Color(0xFFC2410C), const Color(0xFF14532D)];
                  bgColor = colors[index % colors.length];
                }
              }

              return Container(
                width: 300,
                margin: const EdgeInsets.only(right: 12),
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  children: [
                    if (banner.image != null)
                      Positioned(
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 150,
                        child: Stack(
                          children: [
                            Positioned.fill(
                              child: CachedNetworkImage(
                                imageUrl: banner.image!.startsWith('http') 
                                    ? banner.image! 
                                    : 'https://ghorbari.tech${banner.image!.startsWith('/') ? '' : '/'}${banner.image}',
                                fit: BoxFit.cover,
                                color: Colors.black.withOpacity(0.3),
                                colorBlendMode: BlendMode.darken,
                                errorWidget: (context, url, err) => Container(
                                  color: bgColor,
                                  child: const Center(
                                    child: Icon(Icons.image_not_supported, color: Colors.white, size: 48),
                                  ),
                                ),
                              ),
                            ),
                            Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    bgColor,
                                    bgColor.withOpacity(0)
                                  ],
                                  begin: Alignment.centerLeft,
                                  end: Alignment.centerRight,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    GestureDetector(
                      onTap: () {
                        final link = banner.link?.toLowerCase() ?? '';
                        if (link.contains('design')) {
                           widget.onNavigateToTab?.call(1);
                        } else if (link.contains('service')) {
                           widget.onNavigateToTab?.call(2);
                        } else {
                           widget.onNavigateToTab?.call(3);
                        }
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (badge.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  badge,
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold),
                                ),
                              ),
                            const SizedBox(height: 12),
                            Text(
                              title,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  height: 1.1),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (subtitle != null && subtitle.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 6),
                                child: Text(
                                  subtitle,
                                  style: TextStyle(
                                      color: Colors.white.withOpacity(0.8),
                                      fontSize: 12),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Text('explore'.tr(),
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold)),
                                const SizedBox(width: 4),
                                const Icon(Icons.arrow_forward,
                                    color: Colors.white, size: 14),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildProductSection(CMSProductSection section, MarketplaceState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                section.title ?? 'Products',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                ),
              ),
              TextButton(
                  onPressed: () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const SearchScreen()));
                  },
                  child: Text('see_all'.tr())),
            ],
          ),
        ),
        _buildProductsHorizontalList(section, state),
      ],
    );
  }

  Widget _buildProductsHorizontalList(CMSProductSection section, MarketplaceState state) {
        // --- SYMMETRIC OVERHAUL LOGIC (PHASE 9 - DIRECT STATE & DIAGNOSTICS) ---
        final categorySource = section.categoryId;
        
        // 1. Resolve Parent Category
        Category? parentCat;
        if (categorySource != null) {
          try {
            parentCat = state.categories.cast<Category>().firstWhere(
              (c) => c.id == categorySource || c.name.toLowerCase() == categorySource.toLowerCase(),
              orElse: () => state.categories.cast<Category>().firstWhere(
                (c) => c.name.toLowerCase().contains(categorySource.split(' ').first.toLowerCase()),
              ),
            );
          } catch (e) {
            parentCat = null;
          }
        }

        if (parentCat == null) {
           return const SizedBox.shrink();
        }

        // 2. Resolve Descendants
        final Set<String> targetIdsSet = {parentCat.id};
        void addChildren(String pid) {
          final children = state.categories.where((c) => c.parentId == pid).map((c) => c.id).toList();
          for (var cid in children) {
            if (targetIdsSet.add(cid)) {
              addChildren(cid);
            }
          }
        }
        addChildren(parentCat.id);
        final List<String> targetCategoryIds = targetIdsSet.toList();

        // 3. Filter Products
        final products = state.products.where((p) => targetCategoryIds.contains(p.categoryId)).toList();

        if (products.isEmpty) {
           return const SizedBox.shrink();
        }

        return SizedBox(
          height: 240,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: products.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.only(right: 12),
                child: SizedBox(
                  width: 160,
                  child: ProductCard(
                    product: products[index],
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => ProductDetailsScreen(
                                product: products[index]))),
                  ),
                ),
              );
            },
          ),
        );
  }

  Widget _buildCircularCategory(
      String name, String icon, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 80,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        child: Column(
          children: [
            Container(
              height: 64,
              width: 64,
              decoration: BoxDecoration(
                color: isSelected
                    ? const Color(0xFFF97316).withOpacity(0.1)
                    : Colors.grey.shade50,
                shape: BoxShape.circle,
                border: Border.all(
                    color: isSelected
                        ? const Color(0xFFF97316)
                        : Colors.grey.shade200,
                    width: 2),
              ),
              child: Center(
                  child: Text(icon, style: const TextStyle(fontSize: 24))),
            ),
            const SizedBox(height: 8),
            Text(name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                    fontSize: 11,
                    fontWeight:
                        isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected
                        ? const Color(0xFFF97316)
                        : const Color(0xFF475569))),
          ],
        ),
      ),
    );
  }
}
