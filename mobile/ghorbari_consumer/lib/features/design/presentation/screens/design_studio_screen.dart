import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/screens/booking_screen.dart';
import 'package:ghorbari_consumer/features/design/presentation/screens/design_booking_wizard_screen.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_bloc.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_state.dart';
import 'package:ghorbari_consumer/shared/models/category.dart';
import 'package:ghorbari_consumer/shared/models/service_item.dart';

class DesignStudioScreen extends StatefulWidget {
  const DesignStudioScreen({super.key});

  @override
  State<DesignStudioScreen> createState() => _DesignStudioScreenState();
}

class _DesignStudioScreenState extends State<DesignStudioScreen> {
  String _searchQuery = '';
  String? _selectedRootId; // selected ROOT category id
  String? _selectedSubId;  // selected SUB category id

  // Color palette cycling for category cards
  final List<Color> _cardColors = [
    const Color(0xFF0F172A),
    const Color(0xFF14532D),
    const Color(0xFF78350F),
    const Color(0xFF1D4ED8),
    const Color(0xFF6B21A8),
    const Color(0xFF9F1239),
  ];

  Color _colorForIndex(int index) =>
      _cardColors[index % _cardColors.length];

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MarketplaceBloc, MarketplaceState>(
      builder: (context, state) {
        final allCats = state.categories;

        // Design category tree helpers
        final designRoots = allCats
            .where((c) => c.type == 'design' && c.level == 0)
            .toList();
        final designSubs = _selectedRootId != null
            ? allCats
                .where((c) =>
                    c.type == 'design' &&
                    c.level == 1 &&
                    c.parentId == _selectedRootId)
                .toList()
            : <Category>[];

        // Read selected_ids from design_display_config CMS key
        final cmsConfig = state.cmsContent.data['design_display_config'];
        final selectedIds = cmsConfig != null && cmsConfig['selected_ids'] is List
            ? List<String>.from(cmsConfig['selected_ids'])
            : <String>[];

        // Items to display in grid: ITEM (level>=2) filtered by CMS selection,
        // further filtered by selected sub/root category
        List<Category> gridItems = allCats.where((c) {
          if (c.type != 'design') return false;
          if (c.level < 2) return false;
          // If CMS has config, only show selected items
          if (selectedIds.isNotEmpty && !selectedIds.contains(c.id)) return false;
          return true;
        }).toList();

        // Filter by selected sub-category
        if (_selectedSubId != null) {
          gridItems = gridItems
              .where((c) => c.parentId == _selectedSubId)
              .toList();
        } else if (_selectedRootId != null) {
          // Filter to items under this root (via any of its subs)
          final subIds = allCats
              .where((c) =>
                  c.type == 'design' &&
                  c.level == 1 &&
                  c.parentId == _selectedRootId)
              .map((c) => c.id)
              .toSet();
          gridItems = gridItems.where((c) {
            if (c.parentId == _selectedRootId) return true;
            if (subIds.contains(c.parentId)) return true;
            // Check grandparent
            final parent = allCats
                .where((p) => p.id == c.parentId)
                .firstOrNull;
            if (parent != null && subIds.contains(parent.parentId)) return true;
            return false;
          }).toList();
        }

        // Search filter
        if (_searchQuery.isNotEmpty) {
          final q = _searchQuery.toLowerCase();
          gridItems = gridItems.where((c) {
            return c.name.toLowerCase().contains(q) ||
                (c.nameBn?.toLowerCase().contains(q) ?? false);
          }).toList();
        }

        // Two fixed service boxes (ROOT level design categories)
        final structuralRoot = designRoots.firstOrNull;
        final interiorRoot = designRoots.length > 1 ? designRoots[1] : null;

        return Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            title: Text(
              'design_studio'.tr(),
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            backgroundColor: Colors.white,
            foregroundColor: const Color(0xFF0F172A),
            elevation: 0,
            centerTitle: true,
          ),
          body: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Search Bar
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
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
                              hintText: 'search_design'.tr(),
                              hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
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

                // 2. Two Service Type Boxes (ROOT design categories)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: _buildServiceBox(
                          category: structuralRoot,
                          fallbackTitle: 'স্ট্রাকচারাল ডিজাইন',
                          fallbackIcon: Icons.domain_outlined,
                          color: const Color(0xFF14532D),
                          imageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop',
                          serviceType: 'structural',
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildServiceBox(
                          category: interiorRoot,
                          fallbackTitle: 'ইন্টেরিয়র ডিজাইন',
                          fallbackIcon: Icons.weekend_outlined,
                          color: const Color(0xFF0F172A),
                          imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop',
                          serviceType: 'interior',
                        ),
                      ),
                    ],
                  ),
                ),

                // 3. ROOT Category Filter Chips
                if (designRoots.isNotEmpty) ...[
                  SizedBox(
                    height: 50,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      children: [
                        _buildFilterChip(null, 'সব'),
                        ...designRoots.map((cat) => Padding(
                              padding: const EdgeInsets.only(left: 8),
                              child: _buildFilterChip(cat.id, cat.nameBn ?? cat.name),
                            )),
                      ],
                    ),
                  ),
                  // 3b. SUB Category Chips (shown when a root is selected)
                  if (_selectedRootId != null && designSubs.isNotEmpty)
                    SizedBox(
                      height: 44,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
                        children: [
                          _buildSubChip(null, 'সব উপ-বিভাগ'),
                          ...designSubs.map((cat) => Padding(
                                padding: const EdgeInsets.only(left: 8),
                                child: _buildSubChip(cat.id, cat.nameBn ?? cat.name),
                              )),
                        ],
                      ),
                    ),
                ],

                // 4. Divider + count row
                const Divider(height: 1),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${gridItems.length} ${"packages_found".tr()}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      Text(
                        'sorted_by_tier'.tr(),
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                      ),
                    ],
                  ),
                ),

                // 5. Item Grid
                gridItems.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 48),
                          child: Column(
                            children: [
                              Icon(Icons.design_services_outlined,
                                  size: 64, color: Colors.grey.shade300),
                              const SizedBox(height: 16),
                              Text('no_packages_found'.tr(),
                                  style: TextStyle(color: Colors.grey.shade500)),
                            ],
                          ),
                        ),
                      )
                    : GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.68,
                          crossAxisSpacing: 14,
                          mainAxisSpacing: 14,
                        ),
                        itemCount: gridItems.length,
                        itemBuilder: (context, index) =>
                            _buildItemCard(gridItems[index], index, allCats),
                      ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildServiceBox({
    Category? category,
    required String fallbackTitle,
    required IconData fallbackIcon,
    required Color color,
    required String imageUrl,
    required String serviceType,
  }) {
    final title = category?.nameBn ?? category?.name ?? fallbackTitle;
    final catId = category?.id ?? serviceType;
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => DesignBookingWizardScreen(
            initialService: serviceType == 'structural' ? 'structural-architectural' : 'interior',
          ),
        ),
      ),
      child: Container(
        height: 165,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(14),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            Positioned.fill(
              child: Image.network(
                category?.icon ?? imageUrl,
                fit: BoxFit.cover,
                color: color.withOpacity(0.65),
                colorBlendMode: BlendMode.srcATop,
                errorBuilder: (_, __, ___) => Container(color: color),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(fallbackIcon, color: Colors.white, size: 20),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      height: 1.4,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white.withOpacity(0.7)),
                      borderRadius: BorderRadius.circular(20),
                      color: Colors.white.withOpacity(0.12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'book_service'.tr(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.arrow_forward, color: Colors.white, size: 12),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String? value, String label) {
    final isSelected = _selectedRootId == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedRootId = selected ? value : null;
          _selectedSubId = null;
        });
      },
      selectedColor: const Color(0xFFC2410C).withOpacity(0.1),
      showCheckmark: true,
      checkmarkColor: const Color(0xFFC2410C),
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: isSelected ? const Color(0xFFC2410C).withOpacity(0.5) : Colors.grey.shade300,
        ),
      ),
      labelStyle: TextStyle(
        color: isSelected ? const Color(0xFFC2410C) : Colors.black87,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 13,
      ),
    );
  }

  Widget _buildSubChip(String? value, String label) {
    final isSelected = _selectedSubId == value;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedSubId = selected ? value : null;
        });
      },
      backgroundColor: Colors.grey.shade100,
      selectedColor: const Color(0xFFC2410C),
      checkmarkColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: isSelected ? const Color(0xFFC2410C) : Colors.grey.shade300,
        ),
      ),
      labelStyle: TextStyle(
        fontSize: 12,
        color: isSelected ? Colors.white : Colors.black87,
      ),
    );
  }

  Widget _buildItemCard(Category cat, int index, List<Category> allCats) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: Colors.grey.shade100),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Image and Rating Overlay
          Expanded(
            child: Stack(
              fit: StackFit.expand,
              children: [
                CachedNetworkImage(
                  imageUrl: cat.icon ?? '',
                  fit: BoxFit.cover,
                  errorWidget: (context, url, error) => Container(
                    color: Colors.grey.shade200,
                    child: const Center(
                      child: Icon(Icons.broken_image, color: Colors.grey),
                    ),
                  ),
                ),
                // Rating Pill
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.star, color: Colors.amber, size: 14),
                        SizedBox(width: 4),
                        Text(
                          '4.8',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
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
                    crossAxisAlignment: CrossAxisAlignment.end,
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
                            '৳১৬০০',
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
                          // Find root category
                          // Find root category route
                          String rootType = ''; 
                          
                          // 1. Traverse up the tree to find root type by keywords
                          Category? current = cat;
                          while (current != null) {
                            final nameEn = current.name.toLowerCase();
                            final nameBn = current.nameBn?.toLowerCase() ?? '';
                            
                            if (nameEn.contains('structur') || nameEn.contains('architectur') || nameBn.contains('স্ট্রাকচারাল')) {
                              rootType = 'structural-architectural';
                              break;
                            } else if (nameEn.contains('interior') || nameBn.contains('ইন্টেরিয়র')) {
                              rootType = 'interior';
                              break;
                            }
                            
                            if (current.parentId == null || current.parentId!.isEmpty) break;
                            
                            final parentId = current.parentId;
                            try {
                                current = allCats.firstWhere((c) => c.id == parentId);
                            } catch (_) {
                                current = null;
                            }
                          }
                          
                          // 2. Check explicitly by root IDs (fallback if keywords failed to match cleanly)
                          if (rootType.isEmpty) {
                            try {
                              final structuralRootId = allCats.firstWhere((c) => c.type == 'design' && c.level == 0 && (c.name.toLowerCase().contains('structur') || c.name.toLowerCase().contains('architectur'))).id;
                              final interiorRootId = allCats.firstWhere((c) => c.type == 'design' && c.level == 0 && c.name.toLowerCase().contains('interior')).id;
                              
                              Category? ancestor = cat;
                              while(ancestor != null) {
                                if (ancestor.parentId == structuralRootId || ancestor.id == structuralRootId) { rootType = 'structural-architectural'; break; }
                                if (ancestor.parentId == interiorRootId || ancestor.id == interiorRootId) { rootType = 'interior'; break; }
                                
                                final pid = ancestor.parentId;
                                if (pid == null || pid.isEmpty) break;
                                try { ancestor = allCats.firstWhere((c) => c.id == pid); } catch (_) { ancestor = null; }
                              }
                            } catch (_) {
                                // Root IDs not explicitly found
                            }
                          }

                          // 3. Ultimate Fallback if ancestry is broken/unlinked in database
                          if (rootType.isEmpty) {
                              final name = cat.name.toLowerCase();
                              if (name.contains('build') || name.contains('plan') || name.contains('approv') || name.contains('foundat') || name.contains('draw') || name.contains('floor')) {
                                  rootType = 'structural-architectural';
                              } else {
                                  // Default to interior for specific rooms, furniture, paints, ceilings, etc.
                                  rootType = 'interior';
                              }
                          }

                          // Always route to the wizard now!
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => DesignBookingWizardScreen(
                                initialService: rootType,
                              ),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F172A),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                          minimumSize: const Size(0, 32),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text(
                          'বুকিং দিন',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
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
}
