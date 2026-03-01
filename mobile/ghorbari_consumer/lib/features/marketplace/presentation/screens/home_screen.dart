import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_bloc.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_event.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_state.dart';
import 'package:ghorbari_consumer/shared/models/cms_content.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/widgets/product_card.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/product_details_screen.dart';
import 'package:ghorbari_consumer/shared/models/product.dart';
import 'package:ghorbari_consumer/features/services/presentation/bloc/service_bloc.dart';
import 'package:ghorbari_consumer/features/services/presentation/bloc/service_event.dart';
import 'package:ghorbari_consumer/features/services/presentation/bloc/service_state.dart';
import 'package:ghorbari_consumer/features/services/presentation/widgets/service_card.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/screens/booking_screen.dart';
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
import 'package:ghorbari_consumer/shared/models/service_item.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    context.read<MarketplaceBloc>().add(MarketplaceFetchCMSContent());
    context.read<MarketplaceBloc>().add(MarketplaceFetchCategories());
    context.read<MarketplaceBloc>().add(const MarketplaceFetchProducts());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MarketplaceBloc, MarketplaceState>(
      builder: (context, state) {
        return Scaffold(
          backgroundColor: Colors.white,
          body: CustomScrollView(
            slivers: [
              _buildSliverAppBar(context),
              _buildDynamicCMSContentFromState(context, state),
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDynamicCMSContentFromState(BuildContext context, MarketplaceState state) {
    if (state.cmsStatus == MarketplaceStatus.loading && state.cmsContent.isEmpty) {
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

    List<Widget> sections = [];
    try {
      final content = state.cmsContent.data;
      if (content.isEmpty) {
        return const SliverToBoxAdapter(child: Center(child: Padding(padding: EdgeInsets.all(20), child: Text('No CMS Content found'))));
      }

      print('DEBUG: Building HomeScreen sections for keys: ${content.keys.join(", ")}');

      // 0. Hero Section
      sections.add(_buildHeroSlider(content['hero_section']));

      // 1. Featured Categories
      if (content['featured_categories'] != null) {
        sections.add(_buildFeaturedCategories(CMSCategorySection.fromJson(content['featured_categories'])));
      }

      // 2. Design & Planning
      sections.add(_buildDesignServicesSection(content['design_services']));

      // 3. Product Sections
      if (content['product_sections'] is List) {
        for (var section in content['product_sections']) {
          sections.add(_buildProductSection(CMSProductSection.fromJson(section)));
        }
      }

      // 4. Service Sections
      if (content['service_sections'] is List) {
        for (var section in content['service_sections']) {
          sections.add(_buildServiceSection(CMSProductSection.fromJson(section)));
        }
      }

      // 5. Promo Banners
      if (content['promo_banners'] != null) {
        sections.add(_buildPromoBanner(content['promo_banners']));
      }

      print('DEBUG: HomeScreen built ${sections.length} sections');
    } catch (e, stackTrace) {
      print('DEBUG: Error building sections: $e\n$stackTrace');
      return SliverToBoxAdapter(
        child: Container(
          padding: const EdgeInsets.all(20),
          color: Colors.red.shade100,
          child: Text('Content Error: $e', style: const TextStyle(color: Colors.red)),
        ),
      );
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
      centerTitle: false,
      title: Image.asset(
        'assets/images/logo.png',
        height: 28,
        errorBuilder: (context, error, stackTrace) => const Text(
          'GHORBARI',
          style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
        ),
      ),
      actions: [
        IconButton(icon: const Icon(Icons.search, color: Color(0xFF0F172A)), onPressed: () {}),
        BlocBuilder<CartBloc, CartState>(
          builder: (context, state) {
            return Stack(
              alignment: Alignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.shopping_cart_outlined, color: Color(0xFF0F172A)),
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CartScreen())),
                ),
                if (state.items.isNotEmpty)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: Color(0xFF2563EB), shape: BoxShape.circle),
                      child: Text('${state.items.length}', style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                    ),
                  ),
              ],
            );
          },
        ),
        IconButton(icon: const Icon(Icons.menu, color: Color(0xFF0F172A)), onPressed: () {}),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildHeroSlider(dynamic rawHeroData) {
    final List<Map<String, dynamic>> defaultSlides = [
      {
        'title': 'নির্মাণ\nমার্কেটপ্লেস',
        'subtitle': 'আপনার সাইটে প্রিমিয়াম সাপ্লাই ডেলিভারি নিন।',
        'image': 'assets/images/hero-materials.png',
        'color': const Color(0xFFEB6841),
        'badge': 'GHORBARI',
      },
      {
        'title': 'স্থাপত্য ও ভবন ডিজাইন',
        'subtitle': 'আপনার স্বপ্নের বাড়ির নকশা করুন।',
        'image': 'assets/images/hero-design.png',
        'color': const Color(0xFF15803D),
        'badge': 'DESIGN',
      },
      {
        'title': 'যাচাইকৃত প্রকৌশলী',
        'subtitle': 'অভিজ্ঞ ইঞ্জিনিয়ার দিয়ে তদারকি করুন।',
        'image': 'assets/images/hero-services.png',
        'color': const Color(0xFF00356B),
        'badge': 'SERVICES',
      },
    ];

    return Container(
      height: 180,
      margin: const EdgeInsets.only(top: 12, bottom: 8),
      child: CarouselSlider(
        options: CarouselOptions(
          height: 180,
          viewportFraction: 0.9,
          enlargeCenterPage: true,
          autoPlay: true,
          autoPlayInterval: const Duration(seconds: 5),
        ),
        items: defaultSlides.map((slide) {
          return Container(
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              color: slide['color'] as Color,
            ),
            clipBehavior: Clip.antiAlias,
            child: Row(
              children: [
                Expanded(
                  flex: 3,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (slide['badge'] != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              slide['badge']!,
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        const SizedBox(height: 8),
                        Flexible(
                          child: Text(
                            slide['title']!,
                            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, height: 1.2),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Flexible(
                          child: Text(
                            slide['subtitle']!,
                            style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 11),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(height: 12),
                          GestureDetector(
                            onTap: () {
                               if (slide['badge'] == 'DESIGN') {
                                 // Navigate to Design booking (first one)
                                  final firstService = ServiceItem(
                                    id: 'arch_01', 
                                    name: 'Architectural Design', 
                                    categoryId: 'design', 
                                    unitPrice: 5000, 
                                    unitType: 'floor'
                                  );
                                  Navigator.push(context, MaterialPageRoute(builder: (context) => BookingScreen(service: firstService)));
                               } else if (slide['badge'] == 'SERVICES') {
                                  // Navigate to first service section listing
                                  Navigator.push(context, MaterialPageRoute(builder: (context) => ServiceListingScreen(
                                    section: CMSProductSection(id: 'srv_sec', title: 'Home Maintenance', categoryId: 'maintenance')
                                  )));
                               } else {
                                  // Default to Marketplace/Category listing
                                  Navigator.push(context, MaterialPageRoute(builder: (context) => CategoryListingScreen(
                                    category: Category(id: 'all', name: 'Marketplace', slug: 'marketplace', type: 'product', level: 0)
                                  )));
                               }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                              child: const Text(
                                'আরও জানুন',
                                style: TextStyle(color: Color(0xFFE7623F), fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Hero(
                    tag: 'hero_image_${slide['title']}',
                    child: Image.asset(
                      slide['image']!,
                      fit: BoxFit.contain,
                      alignment: Alignment.centerRight,
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

  Widget _buildFeaturedCategories(CMSCategorySection section) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (section.title != null && section.title!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              section.title!,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
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
              return _buildCircularCategory(
                item.name,
                CategoryIconHelper.getIcon(item.name),
                false,
                () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => CategoryListingScreen(
                    category: Category(id: item.id, name: item.name, slug: item.slug ?? '', type: 'product', level: 0)
                  )));
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDesignServicesSection(dynamic designData) {
    final List<Map<String, dynamic>> designItems = [
      {
        'title': 'Architectural Design',
        'description': 'Complete building blueprints & permits',
        'image': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
        'rating': 4.9,
        'price': 5000,
      },
      {
        'title': 'Interior Design',
        'description': 'Modern & functional space planning',
        'image': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop',
        'rating': 4.8,
        'price': 25000,
      },
      {
        'title': 'Approval Service',
        'description': 'RAJUK and other regulatory body approval assistance.',
        'image': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop',
        'rating': 5.0,
        'price': 12000,
      },
    ];

    print('DEBUG: Rendering DesignServicesSection with ${designItems.length} items');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Text(
            'Design & Planning',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
          ),
        ),
        SizedBox(
          height: 280,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: designItems.length,
            itemBuilder: (context, index) {
              return _buildDesignCard(designItems[index]);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDesignCard(Map<String, dynamic> item) {
    return Container(
      width: 240,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CachedNetworkImage(
            imageUrl: item['image'] ?? '',
            height: 140,
            width: double.infinity,
            fit: BoxFit.cover,
            errorWidget: (context, url, error) => Container(color: Colors.grey.shade200, child: const Icon(Icons.broken_image)),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['title'] ?? '', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold), maxLines: 1),
                const SizedBox(height: 4),
                Text(item['description'] ?? '', style: TextStyle(fontSize: 11, color: Colors.grey.shade500), maxLines: 1),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (item['price'] != null)
                      Text('৳${item['price']}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                    ElevatedButton(
                      onPressed: () {
                        final service = ServiceItem(
                          id: item['title'].toString().toLowerCase().replaceAll(' ', '_'),
                          name: item['title'] ?? 'Service',
                          categoryId: 'design',
                          unitPrice: (item['price'] ?? 0).toDouble(),
                          unitType: 'sqft',
                          imageUrl: item['image'],
                          rating: (item['rating'] ?? 4.5).toDouble(),
                        );
                        Navigator.push(context, MaterialPageRoute(builder: (context) => BookingScreen(service: service)));
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white, minimumSize: const Size(64, 32)),
                      child: const Text('Book', style: TextStyle(fontSize: 10)),
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

  Widget _buildProductSection(CMSProductSection section) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(section.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              TextButton(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => CategoryListingScreen(
                    category: Category(id: section.categoryId ?? 'all', name: section.title, slug: section.title.toLowerCase(), type: 'product', level: 0)
                  )));
                }, 
                child: const Text('See All')
              ),
            ],
          ),
        ),
        _buildProductsHorizontalList(section),
      ],
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
              Text(section.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              TextButton(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => ServiceListingScreen(section: section)));
                }, 
                child: const Text('See All')
              ),
            ],
          ),
        ),
        _buildProductsHorizontalList(section),
      ],
    );
  }

  Widget _buildPromoBanner(dynamic promoData) {
    final List<Map<String, dynamic>> banners = [
      {
        'title': 'Expert-Selected,\nfast delivered',
        'subtitle': 'Quality Guarantee',
        'badge': 'Top Picks',
        'image': 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=400&fit=crop',
        'color': const Color(0xFF0F172A),
      },
      {
        'title': 'The one app\nfor everything',
        'subtitle': 'Price alerts and offers',
        'badge': 'New',
        'image': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
        'color': const Color(0xFFC2410C),
      },
      {
        'title': 'The ones\nyou love',
        'subtitle': 'Trusted and durable',
        'badge': 'Best Value',
        'image': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop',
        'color': const Color(0xFF14532D),
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Text(
            'Our current deals',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.2),
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
              return Container(
                width: 300,
                margin: const EdgeInsets.only(right: 12),
                decoration: BoxDecoration(
                  color: banner['color'] as Color,
                  borderRadius: BorderRadius.circular(20),
                ),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  children: [
                    Positioned(
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 150,
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: CachedNetworkImage(
                              imageUrl: banner['image']!,
                              fit: BoxFit.cover,
                              color: Colors.black.withOpacity(0.3),
                              colorBlendMode: BlendMode.darken,
                            ),
                          ),
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [(banner['color'] as Color), (banner['color'] as Color).withOpacity(0)],
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
                         final categoryName = banner['title'].toString().contains('Expert') ? 'Construction Materials' : 'New Offers';
                         Navigator.push(context, MaterialPageRoute(builder: (context) => CategoryListingScreen(
                          category: Category(id: 'promo_${index}', name: categoryName, slug: 'promo', type: 'product', level: 0)
                        )));
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                banner['badge']!,
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              banner['title']!,
                              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, height: 1.1),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              banner['subtitle']!,
                              style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12),
                            ),
                            const SizedBox(height: 16),
                            const Row(
                              children: [
                                Text('Explore', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                SizedBox(width: 4),
                                Icon(Icons.arrow_forward, color: Colors.white, size: 14),
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

  Widget _buildProductsHorizontalList(CMSProductSection section) {
    final categoryId = section.categoryId;
    return BlocBuilder<MarketplaceBloc, MarketplaceState>(
      builder: (context, state) {
        if (state.productsStatus == MarketplaceStatus.loading) {
          return const SizedBox(height: 200, child: Center(child: CircularProgressIndicator()));
        }
        
        final products = categoryId != null 
            ? state.products.where((p) {
                if (p.categoryId == categoryId) return true;
                final cat = state.categories.cast<Category?>().firstWhere((c) => c?.id == p.categoryId, orElse: () => null);
                if (cat == null) return false;
                final searchId = categoryId.toLowerCase();
                 // Improved matching including ID check
                return cat.id.toLowerCase() == searchId || cat.name.toLowerCase() == searchId || cat.slug.toLowerCase() == searchId;
              }).toList()
            : state.products;

        final sectionTitle = section.title.toLowerCase();
        final isService = sectionTitle.contains('service') || sectionTitle.contains('maintenance');
        final isCement = sectionTitle.contains('cement') || 
                         categoryId?.toLowerCase().contains('cement') == true || 
                         products.any((p) => p.name.toLowerCase().contains('cement'));
        final isBrick = sectionTitle.contains('brick') ||
                        categoryId?.toLowerCase().contains('brick') == true ||
                        products.any((p) => p.name.toLowerCase().contains('brick'));
         final isSteel = sectionTitle.contains('steel') || sectionTitle.contains('metal');

        final List<Product> displayProducts;
        if (products.isEmpty) {
          if (isService) {
            displayProducts = [
              Product(
                id: 's1', 
                name: 'Electrical Wiring', 
                price: 1500, 
                imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop', 
                categoryId: categoryId ?? 'c_srv', 
                sellerId: 'sel_04',
                metadata: {'seller_name': 'PowerSafe Solutions', 'type': 'service'},
              ),
              Product(
                id: 's2', 
                name: 'Plumbing Solutions', 
                price: 1200, 
                imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=400&fit=crop', 
                categoryId: categoryId ?? 'c_srv', 
                sellerId: 'sel_03',
                metadata: {'seller_name': 'The Pipe Fixers', 'type': 'service'},
              ),
              Product(
                id: 's3', 
                name: 'Paint & Polishing', 
                price: 2500, 
                imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop', 
                categoryId: categoryId ?? 'c_srv', 
                sellerId: 'sel_02',
                metadata: {'seller_name': 'Color Masters', 'type': 'service'},
              ),
              Product(
                id: 's4', 
                name: 'Sanitary Installation', 
                price: 1800, 
                imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop', 
                categoryId: categoryId ?? 'c_srv', 
                sellerId: 'sel_06',
                metadata: {'seller_name': 'Elegant Floors', 'type': 'service'},
              ),
            ];
          } else {
            displayProducts = [
              Product(
                id: 'd1', 
                name: isCement ? 'Seven Brand Cement' : (isBrick ? '1st Class Red Bricks' : (isSteel ? 'Seven Star Steel' : 'Premium ${section.title}')), 
                price: isCement ? 520 : (isBrick ? 12 : (isSteel ? 920 : 500)), 
                imageUrl: isCement 
                    ? 'https://images.unsplash.com/photo-1589923188900-85dae523321c?w=600&h=400&fit=crop' 
                    : (isSteel ? 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=400&fit=crop' : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'), 
                categoryId: categoryId ?? 'c1', 
                sellerId: 's1',
                metadata: {'seller_name': 'Auspicious'},
              ),
              Product(
                id: 'd2', 
                name: isBrick ? 'Picket Bricks' : (isCement ? 'Standard Cement' : (isSteel ? 'TMT Bar (Standard)' : 'Standard ${section.title}')), 
                price: isBrick ? 10 : (isCement ? 480 : (isSteel ? 850 : 350)), 
                imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&h=400&fit=crop', 
                categoryId: categoryId ?? 'c1', 
                sellerId: 's1',
                metadata: {'seller_name': 'Auspicious'},
              ),
            ];
          }
        } else {
          displayProducts = products;
        }

        print('DEBUG: Section "$categoryId" rendering ${displayProducts.length} items (isCement: $isCement, isBrick: $isBrick)');

        print('DEBUG: HorizontalList for "$categoryId" found ${products.length} products (Total in state: ${state.products.length})');

        return SizedBox(
          height: 240,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: displayProducts.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.only(right: 12),
                child: SizedBox(
                   width: 160,
                   child: ProductCard(
                     product: displayProducts[index],
                     onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => ProductDetailsScreen(product: displayProducts[index]))),
                   ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildCircularCategory(String name, String icon, bool isSelected, VoidCallback onTap) {
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
                color: isSelected ? const Color(0xFFF97316).withOpacity(0.1) : Colors.grey.shade50,
                shape: BoxShape.circle,
                border: Border.all(color: isSelected ? const Color(0xFFF97316) : Colors.grey.shade200, width: 2),
              ),
              child: Center(child: Text(icon, style: const TextStyle(fontSize: 24))),
            ),
            const SizedBox(height: 8),
            Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, color: isSelected ? const Color(0xFFF97316) : const Color(0xFF475569))),
          ],
        ),
      ),
    );
  }
}
