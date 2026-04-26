import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/bloc/marketplace_bloc.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/bloc/marketplace_state.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/widgets/product_card.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/product_details_screen.dart';
import 'package:carousel_slider/carousel_slider.dart';
// import 'package:pointer_interceptor/pointer_interceptor.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:easy_localization/easy_localization.dart';

class ProductExploreScreen extends StatefulWidget {
  const ProductExploreScreen({super.key});

  @override
  State<ProductExploreScreen> createState() => _ProductExploreScreenState();
}

class _ProductExploreScreenState extends State<ProductExploreScreen> {
  String? _selectedRootId;
  String? _selectedSubId;
  String _searchQuery = '';

  String _minPrice = '';
  String _maxPrice = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('product_marketplace'.tr(),
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterSheet(context),
          ),
        ],
      ),
      body: BlocBuilder<MarketplaceBloc, MarketplaceState>(
        builder: (context, state) {
          if (state.productsStatus == MarketplaceStatus.loading &&
              state.categoriesStatus == MarketplaceStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }

          final allCategories = state.categories.where((c) => c.type == 'product').toList();
          final rootCategories = allCategories
              .where((c) => c.level == 0 || c.parentId == null)
              .toList();
          final subCategories = _selectedRootId != null
              ? allCategories.where((c) => c.parentId == _selectedRootId).toList()
              : [];

          // 2. Pre-calculate search IDs for filtering (Symmetric Architecture)
          List<String>? targetIds;
          if (_selectedSubId != null) {
            targetIds = [_selectedSubId!];
          } else if (_selectedRootId != null) {
            // Find all subcategories for this root
            final rootId = _selectedRootId!;
            final subIds = allCategories
                .where((c) => c.parentId == rootId)
                .map((c) => c.id)
                .toList();
            targetIds = [rootId, ...subIds];
          }

          final filteredProducts = state.products.where((product) {
            // A. Category Filter
            if (targetIds != null && !targetIds.contains(product.categoryId)) {
              return false;
            }

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
            } catch (e) {}

            // C. Search Filter
            if (_searchQuery.isNotEmpty) {
              final q = _searchQuery.toLowerCase();
              final name = product.name.toLowerCase();
              if (!name.contains(q)) return false;
            }

            return true;
          }).toList();

          return SingleChildScrollView(
            child: Column(
              children: [
                // 1. Search Bar
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Row(
                      children: [
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 12),
                          child: Icon(Icons.search, color: Color(0xFF94A3B8), size: 20),
                        ),
                        Expanded(
                          child: TextField(
                            onChanged: (value) => setState(() => _searchQuery = value),
                            decoration: InputDecoration(
                              hintText: 'search_products'.tr(),
                              hintStyle: const TextStyle(
                                  color: Color(0xFF94A3B8), fontSize: 14),
                              border: InputBorder.none,
                              isDense: true,
                              contentPadding: EdgeInsets.zero,
                            ),
                            style: const TextStyle(fontSize: 14, color: Color(0xFF0F172A)),
                          ),
                        ),
                        if (_searchQuery.isNotEmpty)
                          GestureDetector(
                            onTap: () => setState(() => _searchQuery = ''),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 12),
                              child: Icon(Icons.close, color: Color(0xFF94A3B8), size: 18),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                // 2. Banner Slider
                _buildPromoBanners(),
                // 3. Root Category Chips
                if (rootCategories.isNotEmpty)
                  SizedBox(
                    height: 50,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: rootCategories.length + 1,
                      itemBuilder: (context, index) {
                        if (index == 0) {
                          final isSelected = _selectedRootId == null;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: ChoiceChip(
                              label: Text('all_products'.tr()),
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
                            label: Text(
                              (context.locale.languageCode == 'bn' && cat.nameBn != null && cat.nameBn!.isNotEmpty)
                                  ? cat.nameBn!
                                  : cat.name,
                            ),
                            selected: isSelected,
                            onSelected: (selected) {
                              setState(() {
                                _selectedRootId = selected ? cat.id : null;
                                _selectedSubId = null;
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
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  height: (_selectedRootId != null && subCategories.isNotEmpty) ? 50 : 0,
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: subCategories.map((sub) {
                        final isSelected = _selectedSubId == sub.id;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: FilterChip(
                            label: Text(
                              (context.locale.languageCode == 'bn' && sub.nameBn != null && sub.nameBn!.isNotEmpty)
                                  ? sub.nameBn!
                                  : sub.name,
                            ),
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
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${filteredProducts.length} ${"products_found".tr()}',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
                      Text('optimized_by_newest'.tr(),
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade400)),
                    ],
                  ),
                ),
                filteredProducts.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 48.0),
                          child: Column(
                            children: [
                              Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey.shade300),
                              const SizedBox(height: 16),
                              Text('no_products_found'.tr(), style: TextStyle(color: Colors.grey.shade500)),
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
                                builder: (context) => ProductDetailsScreen(product: filteredProducts[index]),
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
        'image': 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?w=600&h=400&fit=crop',
        'color': const Color(0xFF0F172A),
        'badge': 'Offers',
        'isNetwork': true,
      },
      {
        'title': 'Premium Materials',
        'subtitle': 'Top-tier cement & steel delivered directly.',
        'image': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
        'color': const Color(0xFFC2410C),
        'badge': 'Quality',
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
          return Container(
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
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 20, right: 20, top: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Filter Prices', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: TextField(controller: minController, decoration: const InputDecoration(labelText: 'Min Price'))),
                const SizedBox(width: 16),
                Expanded(child: TextField(controller: maxController, decoration: const InputDecoration(labelText: 'Max Price'))),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _minPrice = minController.text;
                  _maxPrice = maxController.text;
                });
                Navigator.pop(context);
              },
              child: const Text('Apply'),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
