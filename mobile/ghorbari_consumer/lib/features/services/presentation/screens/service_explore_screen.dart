import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_bloc.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_state.dart';
import 'package:ghorbari_consumer/features/services/presentation/widgets/service_card.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:pointer_interceptor/pointer_interceptor.dart';
import 'package:ghorbari_consumer/shared/models/service_item.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ServiceExploreScreen extends StatefulWidget {
  const ServiceExploreScreen({super.key});

  @override
  State<ServiceExploreScreen> createState() => _ServiceExploreScreenState();
}

class _ServiceExploreScreenState extends State<ServiceExploreScreen> {
  String? _selectedRootId;
  String? _selectedSubId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('GHORBARI Services',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
      ),
      body: BlocBuilder<MarketplaceBloc, MarketplaceState>(
        builder: (context, state) {
          if (state.categoriesStatus == MarketplaceStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }

          // 1. Get Categories
          final allCategories = state.categories.where((c) => c.type == 'service').toList();
          
          final rootCategories = allCategories
              .where((c) => c.level == 0 || c.parentId == null)
              .toList();
              
          final subCategoriesForRoot = _selectedRootId != null
              ? allCategories.where((c) => c.parentId == _selectedRootId).toList()
              : <dynamic>[];

          // 2. Filter Subcategories for Grid (Subcategories act as the distinct items here)
          final allSubcategories = allCategories.where((c) => c.parentId != null && c.level > 0).toList();
          
          final displaySubcategories = allSubcategories.where((sub) {
            // A. Category Filter
            if (_selectedSubId != null) {
               return sub.id == _selectedSubId;
            } else if (_selectedRootId != null) {
               return sub.parentId == _selectedRootId;
            }
            return true; // if neither is selected, show all subcategories
          }).toList();


          return SingleChildScrollView(
            child: Column(
              children: [
              // --- HERO BANNER SLIDER ---
              _buildPromoBanners(),

              // --- TOP: Root Categories (Horizontal Scroll) ---
              if (rootCategories.isNotEmpty)
                SizedBox(
                  height: 50,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: rootCategories.length + 1, // +1 for "All"
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        final isSelected = _selectedRootId == null;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ChoiceChip(
                            label: const Text('All Services'),
                            selected: isSelected,
                            onSelected: (selected) {
                              if (selected) {
                                setState(() {
                                  _selectedRootId = null;
                                  _selectedSubId = null;
                                });
                              }
                            },
                            selectedColor: const Color(0xFFC2410C).withOpacity(0.1),
                            labelStyle: TextStyle(
                              color: isSelected ? const Color(0xFFC2410C) : Colors.black87,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        );
                      }

                      final cat = rootCategories[index - 1];
                      final isSelected = _selectedRootId == cat.id;

                      return Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: ChoiceChip(
                          label: Text(cat.name),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() {
                              _selectedRootId = selected ? cat.id : null;
                              _selectedSubId = null; // Reset sub logic
                            });
                          },
                          selectedColor: const Color(0xFFC2410C).withOpacity(0.1),
                          labelStyle: TextStyle(
                            color: isSelected ? const Color(0xFFC2410C) : Colors.black87,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      );
                    },
                  ),
                ),

              // --- MIDDLE: Sub Categories (Animated Horizontal Scroll) ---
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                height: (_selectedRootId != null && subCategoriesForRoot.isNotEmpty) ? 50 : 0,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: subCategoriesForRoot.map((sub) {
                      final isSelected = _selectedSubId == sub.id;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: FilterChip(
                          label: Text(sub.name),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() {
                              _selectedSubId = selected ? sub.id : null;
                            });
                          },
                          backgroundColor: Colors.grey.shade100,
                          selectedColor: const Color(0xFFC2410C),
                          checkmarkColor: Colors.white,
                          labelStyle: TextStyle(
                            fontSize: 12,
                            color: isSelected ? Colors.white : Colors.black87,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),

              const Divider(height: 1),

              // --- Filter Status Row ---
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${displaySubcategories.length} Services Found',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),

              // --- BOTTOM: Product Grid ---
              displaySubcategories.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 48.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.handyman_outlined,
                                size: 64, color: Colors.grey.shade300),
                            const SizedBox(height: 16),
                            Text('No services match your filters.',
                                style: TextStyle(color: Colors.grey.shade500)),
                          ],
                        ),
                      ),
                    )
                  : GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.85, // Adjusted to fit the shorter service cards
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: displaySubcategories.length,
                      itemBuilder: (context, index) {
                        final cat = displaySubcategories[index];
                        final price = (cat.metadata?['price'] ?? 0).toDouble();
                        final unit = cat.metadata?['unit'] ?? 'hr';
                        
                        String? icon;
                        if (cat.icon != null && cat.icon!.isNotEmpty) {
                          if (cat.icon!.startsWith('http')) {
                            icon = cat.icon;
                          } else if (cat.icon!.startsWith('/')) {
                            // Assuming local Next.js images are served from a known domain or just replace with placeholder for now if host unknown
                            // For local testing, we might need a generic fallback or actual web url
                            icon = (kIsWeb ? 'http://localhost:3000' : 'http://10.0.2.2:3000') + cat.icon!;
                          } else {
                            icon = Supabase.instance.client.storage
                                .from('public')
                                .getPublicUrl(cat.icon!);
                          }
                        }
                        
                        final sItem = ServiceItem(
                           id: cat.id,
                           name: cat.name,
                           description: cat.nameBn, // can be null
                           unitPrice: price,
                           unitType: unit,
                           rating: 4.8,
                           imageUrl: icon ?? '',
                           categoryId: cat.parentId ?? cat.id,
                           providerId: 'provider_ghorbari',
                        );
                        
                        return ServiceCard(
                          service: sItem,
                          onTap: () {
                             // Handling inside ServiceCard directly
                          },
                        );
                      },
                    ),
            ],
          ),
          );
        },
      ),
    );
  }

  Widget _buildPromoBanners() {
    final List<Map<String, dynamic>> banners = [
      {
        'title': 'Premium Materials',
        'subtitle': 'Top-tier cement & steel delivered directly.',
        'image': 'assets/images/hero-materials.png',
        'color': const Color(0xFFC2410C),
        'badge': 'Quality',
        'isNetwork': false,
      },
      {
        'title': 'Expert Artisans',
        'subtitle': 'Certified masters in all construction services.',
        'image': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
        'color': const Color(0xFF14532D),
        'badge': 'Pro',
        'isNetwork': true,
      },
      {
        'title': 'Trade Discounts',
        'subtitle': 'Special pricing for verified professionals.',
        'image': 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?w=600&h=400&fit=crop',
        'color': const Color(0xFF0F172A),
        'badge': 'Offers',
        'isNetwork': true,
      },
    ];

    return Container(
      height: 140,
      margin: const EdgeInsets.only(top: 12, bottom: 12),
      child: CarouselSlider(
        options: CarouselOptions(
          height: 140,
          viewportFraction: 0.9,
          enlargeCenterPage: true,
          autoPlay: true,
          autoPlayInterval: const Duration(seconds: 4),
        ),
        items: banners.map((slide) {
          return PointerInterceptor(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: slide['color'] as Color,
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                children: [
                   // Background Image overlay
                   Positioned(
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 150,
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: slide['isNetwork'] == true
                                ? Image.network(
                                    slide['image']!,
                                    fit: BoxFit.cover,
                                    color: Colors.black.withOpacity(0.3),
                                    colorBlendMode: BlendMode.darken,
                                    errorBuilder: (context, error, stackTrace) => Container(
                                      color: slide['color'],
                                      child: const Center(
                                        child: Icon(Icons.image_not_supported, color: Colors.white, size: 48),
                                      ),
                                    ),
                                  )
                                : Image.asset(
                                    slide['image']!,
                                    fit: BoxFit.cover,
                                    color: Colors.black.withOpacity(0.3),
                                    colorBlendMode: BlendMode.darken,
                                    errorBuilder: (context, error, stackTrace) => Container(
                                      color: slide['color'],
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
                                  (slide['color'] as Color),
                                  (slide['color'] as Color).withOpacity(0)
                                ],
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  
                  // Content
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            slide['badge']!,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          slide['title']!,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              height: 1.2),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        SizedBox(
                          width: MediaQuery.of(context).size.width * 0.5,
                          child: Text(
                            slide['subtitle']!,
                            style: TextStyle(
                                color: Colors.white.withOpacity(0.9),
                                fontSize: 10),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
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
}
