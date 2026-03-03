import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_bloc.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_state.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/widgets/product_card.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/product_details_screen.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:pointer_interceptor/pointer_interceptor.dart';
import 'package:cached_network_image/cached_network_image.dart';

class ProductExploreScreen extends StatefulWidget {
  const ProductExploreScreen({super.key});

  @override
  State<ProductExploreScreen> createState() => _ProductExploreScreenState();
}

class _ProductExploreScreenState extends State<ProductExploreScreen> {
  String? _selectedRootId;
  String? _selectedSubId;

  // Ideally, these would go in a bloc/cubit, but local state works for UI filtering
  String _minPrice = '';
  String _maxPrice = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Construction Marketplace',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // Open a bottom sheet for price filtering
              _showFilterSheet(context);
            },
          ),
        ],
      ),
      body: BlocBuilder<MarketplaceBloc, MarketplaceState>(
        builder: (context, state) {
          if (state.productsStatus == MarketplaceStatus.loading &&
              state.categoriesStatus == MarketplaceStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }

          // 1. Get Categories
          final allCategories = state.categories;
          final rootCategories = allCategories
              .where((c) => c.level == 0 || c.parentId == null)
              .toList();
          final subCategories = _selectedRootId != null
              ? allCategories.where((c) => c.parentId == _selectedRootId).toList()
              : [];

          // 2. Filter Products
          final filteredProducts = state.products.where((product) {
            // A. Category Filter
            bool categoryMatch = true;
            if (_selectedSubId != null) {
               categoryMatch = (product.categoryId == _selectedSubId);
            } else if (_selectedRootId != null) {
               // Needs to match root, or any sub of root
               if (product.categoryId == _selectedRootId) {
                 categoryMatch = true;
               } else {
                 final isChild = subCategories.any((sub) => sub.id == product.categoryId);
                 categoryMatch = isChild;
               }
            }

            if (!categoryMatch) return false;

            // B. Price Filter
            try {
              final price = product.price.toDouble();
              if (_minPrice.isNotEmpty) {
                 final min = double.parse(_minPrice);
                 if (price < min) return false;
              }
              if (_maxPrice.isNotEmpty) {
                 final max = double.parse(_maxPrice);
                 if (price > max) return false;
              }
            } catch (e) {
              // Ignore parse errors
            }

            return true;
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
                            label: const Text('All Products'),
                            selected: isSelected,
                            onSelected: (selected) {
                              if (selected) {
                                setState(() {
                                  _selectedRootId = null;
                                  _selectedSubId = null;
                                });
                              }
                            },
                            selectedColor: const Color(0xFF2563EB).withOpacity(0.1),
                            labelStyle: TextStyle(
                              color: isSelected ? const Color(0xFF2563EB) : Colors.black87,
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
                          selectedColor: const Color(0xFF2563EB).withOpacity(0.1),
                          labelStyle: TextStyle(
                            color: isSelected ? const Color(0xFF2563EB) : Colors.black87,
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
                height: (_selectedRootId != null && subCategories.isNotEmpty) ? 50 : 0,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: subCategories.map((sub) {
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
                          selectedColor: const Color(0xFF2563EB),
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
                      '${filteredProducts.length} Products Found',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    Text(
                      'Optimized by Newest',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade400,
                      ),
                    ),
                  ],
                ),
              ),

              // --- BOTTOM: Product Grid ---
              filteredProducts.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 48.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inventory_2_outlined,
                                size: 64, color: Colors.grey.shade300),
                            const SizedBox(height: 16),
                            Text('No products match your filters.',
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
                        childAspectRatio: 0.7,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: filteredProducts.length,
                      itemBuilder: (context, index) {
                        return ProductCard(
                          product: filteredProducts[index],
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ProductDetailsScreen(
                                  product: filteredProducts[index]),
                            ),
                          ),
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
        'title': 'Trade Discounts',
        'subtitle': 'Special pricing for verified professionals.',
        'image': 'assets/images/hero-materials.png', // Re-using home image
        'color': const Color(0xFF0F172A),
        'badge': 'Offers',
      },
      {
        'title': 'Premium Materials',
        'subtitle': 'Top-tier cement & steel delivered directly.',
        'image': 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?w=600&h=400&fit=crop',
        'color': const Color(0xFFC2410C),
        'badge': 'Quality',
        'isNetwork': true,
      },
      {
        'title': 'Fast Delivery',
        'subtitle': 'Next-day delivery on selected stock.',
        'image': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
        'color': const Color(0xFF14532D),
        'badge': 'Logistics',
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
                                ? CachedNetworkImage(
                                    imageUrl: slide['image']!,
                                    fit: BoxFit.cover,
                                    color: Colors.black.withOpacity(0.3),
                                    colorBlendMode: BlendMode.darken,
                                    errorWidget: (context, url, err) => Container(
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

  void _showFilterSheet(BuildContext context) {
    final minController = TextEditingController(text: _minPrice);
    final maxController = TextEditingController(text: _maxPrice);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Filter Prices',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  )
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: minController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'Min Price',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Text('-'),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextField(
                      controller: maxController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'Max Price',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  onPressed: () {
                    setState(() {
                      _minPrice = minController.text;
                      _maxPrice = maxController.text;
                    });
                    Navigator.pop(context);
                  },
                  child: const Text('Apply Filters'),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }
}
