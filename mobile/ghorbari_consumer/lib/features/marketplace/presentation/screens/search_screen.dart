import 'dart:async';
import 'package:flutter/material.dart';
import 'package:Dalankotha_consumer/core/utils/search_service.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/product_details_screen.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/category_listing_screen.dart';
import 'package:Dalankotha_consumer/shared/models/product.dart';
import 'package:Dalankotha_consumer/shared/models/category.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shimmer/shimmer.dart';
// Removed missing localization_utils import

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final SearchService _searchService = SearchService();
  final TextEditingController _controller = TextEditingController();
  List<Map<String, dynamic>> _suggestions = [];
  List<String> _recentSearches = [];
  bool _isLoading = false;
  bool _isShowingResults = false;
  Timer? _debounce;

  // Filter state
  double _minPrice = 0;
  double _maxPrice = 50000;
  String _selectedType = 'all';
  String _sortBy = 'relevance';

  @override
  void initState() {
    super.initState();
    _loadRecentSearches();
  }

  Future<void> _loadRecentSearches() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _recentSearches = prefs.getStringList('recent_searches') ?? [];
    });
  }

  Future<void> _saveSearch(String query) async {
    if (query.trim().isEmpty) return;
    final prefs = await SharedPreferences.getInstance();
    List<String> history = prefs.getStringList('recent_searches') ?? [];
    history.remove(query);
    history.insert(0, query);
    if (history.length > 10) history = history.sublist(0, 10);
    await prefs.setStringList('recent_searches', history);
    _loadRecentSearches();
  }

  void _onSearchChanged(String query) {
    if (_isShowingResults) setState(() => _isShowingResults = false);
    
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () async {
      if (query.trim().length < 2) {
        setState(() => _suggestions = []);
        return;
      }

      setState(() => _isLoading = true);
      final results = await _searchService.getSuggestions(query);
      if (mounted) {
        setState(() {
          _suggestions = results;
          _isLoading = false;
        });
      }
    });
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Filters', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
                  IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
                ],
              ),
              const SizedBox(height: 24),
              const Text('Search Type', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey)),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                children: [
                  ChoiceChip(
                    label: const Text('All'),
                    selected: _selectedType == 'all',
                    onSelected: (s) => setSheetState(() => setState(() => _selectedType = 'all')),
                  ),
                  ChoiceChip(
                    label: const Text('Products'),
                    selected: _selectedType == 'products',
                    onSelected: (s) => setSheetState(() => setState(() => _selectedType = 'products')),
                  ),
                  ChoiceChip(
                    label: const Text('Services'),
                    selected: _selectedType == 'services',
                    onSelected: (s) => setSheetState(() => setState(() => _selectedType = 'services')),
                  ),
                  ChoiceChip(
                    label: const Text('Designs'),
                    selected: _selectedType == 'designs',
                    onSelected: (s) => setSheetState(() => setState(() => _selectedType = 'designs')),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Text('Price Range', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey)),
              RangeSlider(
                values: RangeValues(_minPrice, _maxPrice),
                min: 0,
                max: 100000,
                divisions: 20,
                activeColor: const Color(0xFF003366),
                labels: RangeLabels('৳${_minPrice.round()}', '৳${_maxPrice.round()}'),
                onChanged: (values) {
                  setSheetState(() {
                    setState(() {
                      _minPrice = values.start;
                      _maxPrice = values.end;
                    });
                  });
                },
              ),
              const SizedBox(height: 24),
              const Text('Sort By', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey)),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                children: [
                  FilterChip(
                    label: const Text('Relevance'),
                    selected: _sortBy == 'relevance',
                    onSelected: (s) => setSheetState(() => setState(() => _sortBy = 'relevance')),
                  ),
                  FilterChip(
                    label: const Text('Price: Low to High'),
                    selected: _sortBy == 'price_low',
                    onSelected: (s) => setSheetState(() => setState(() => _sortBy = 'price_low')),
                  ),
                  FilterChip(
                    label: const Text('Price: High to Low'),
                    selected: _sortBy == 'price_high',
                    onSelected: (s) => setSheetState(() => setState(() => _sortBy = 'price_high')),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF003366),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    setState(() => _isShowingResults = true);
                  },
                  child: const Text('Apply Changes', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: const BackButton(color: Colors.black),
        title: Container(
          height: 44,
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(22),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: TextField(
            controller: _controller,
            autofocus: true,
            onChanged: _onSearchChanged,
            onSubmitted: (s) => setState(() => _isShowingResults = true),
            style: const TextStyle(fontSize: 14),
            decoration: InputDecoration(
              hintText: 'Search items...',
              hintStyle: TextStyle(color: Colors.grey.shade400),
              border: InputBorder.none,
              icon: const Icon(Icons.search, size: 20, color: Colors.grey),
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune, color: Colors.black),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: _isLoading
          ? _buildLoadingState()
          : _isShowingResults
            ? _buildResultsView()
            : _controller.text.isEmpty
                ? _buildInitialState()
                : _buildSuggestionsList(),
    );
  }

  Widget _buildLoadingState() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 6,
      itemBuilder: (context, index) => Shimmer.fromColors(
        baseColor: Colors.grey.shade200,
        highlightColor: Colors.grey.shade50,
        child: Container(
          height: 80,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }

  Widget _buildInitialState() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        if (_recentSearches.isNotEmpty) ...[
    Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text('Recent Searches', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
        TextButton(
          onPressed: () async {
            final prefs = await SharedPreferences.getInstance();
            await prefs.remove('recent_searches');
            _loadRecentSearches();
          },
          child: const Text('Clear', style: TextStyle(color: Colors.red)),
        ),
      ],
    ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _recentSearches.map((s) => ActionChip(
              label: Text(s),
              onPressed: () {
                _controller.text = s;
                _onSearchChanged(s);
                setState(() => _isShowingResults = true);
                _saveSearch(s);
              },
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide(color: Colors.grey.shade200)),
            )).toList(),
          ),
          const SizedBox(height: 32),
        ],
        const Text('Trending Now', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
        const SizedBox(height: 16),
        _buildTrendingTile('Cement & Concrete', Icons.foundation),
        _buildTrendingTile('Interior Paint', Icons.format_paint),
        _buildTrendingTile('Modern Kitchen Design', Icons.kitchen),
        _buildTrendingTile('Electrical Services', Icons.electrical_services),
      ],
    );
  }

  Widget _buildTrendingTile(String title, IconData icon) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: const Color(0xFF003366).withOpacity(0.05), shape: BoxShape.circle),
        child: Icon(icon, size: 20, color: const Color(0xFF003366)),
      ),
      title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
      trailing: const Icon(Icons.north_west, size: 16, color: Colors.grey),
      onTap: () {
        _controller.text = title;
        _onSearchChanged(title);
        setState(() => _isShowingResults = true);
        _saveSearch(title);
      },
    );
  }

  Widget _buildResultsView() {
    List<Map<String, dynamic>> results = [..._suggestions];

    // Apply Type Filter
    if (_selectedType != 'all') {
      results = results.where((item) {
        final type = item['type']?.toString() ?? '';
        final metadata = item['metadata'] as Map<String, dynamic>?;
        final section = metadata?['section']?.toString() ?? '';
        
        if (_selectedType == 'products') return section == 'product' || type == 'product';
        if (_selectedType == 'services') return section == 'service' || type == 'service_item' || type == 'service_category';
        if (_selectedType == 'designs') return section == 'design' || type == 'design_category';
        return true;
      }).toList();
    }

    // Apply Price Filter
    results = results.where((s) {
      if (s['price'] == null) return true;
      final price = (s['price']).toDouble();
      return price >= _minPrice && price <= _maxPrice;
    }).toList();

    if (_sortBy == 'price_low') {
      results.sort((a, b) => (a['price'] ?? 0.0).compareTo(b['price'] ?? 0.0));
    } else if (_sortBy == 'price_high') {
      results.sort((a, b) => (b['price'] ?? 0.0).compareTo(a['price'] ?? 0.0));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            '${results.length} results for "${_controller.text}"',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey),
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: results.length,
            itemBuilder: (context, index) => _buildResultItem(results[index]),
          ),
        ),
      ],
    );
  }

  Widget _buildResultItem(Map<String, dynamic> item) {
    final type = item['type']?.toString() ?? 'product';
    final isProduct = type == 'product';
    final isCategory = type.contains('category') || type == 'subcategory';
    final metadata = item['metadata'] as Map<String, dynamic>?;
    
    // Bangla Support: Use Bangla name if metadata exists
    final name = (metadata != null && metadata['name_bn'] != null && metadata['name_bn'].toString().isNotEmpty)
        ? metadata['name_bn'].toString()
        : (item['name'] ?? '');

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Container(
            width: 60,
            height: 60,
            color: Colors.grey.shade100,
            child: item['image'] != null && item['image'].toString().isNotEmpty && item['image'].toString().trim() != ""
                ? (item['image'].toString().startsWith('http') 
                    ? Image.network(
                        item['image'], 
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          color: Colors.grey.shade50,
                          child: Icon(isCategory ? Icons.category : (isProduct ? Icons.inventory_2 : Icons.build), color: Colors.grey.shade300),
                        ),
                      )
                    : Icon(Icons.image, color: Colors.grey.shade300))
                : Container(
                    color: Colors.grey.shade50,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(isCategory ? Icons.category : (isProduct ? Icons.inventory_2 : Icons.build), size: 20, color: Colors.grey.shade300),
                          const Text('NO IMAGE', style: TextStyle(fontSize: 6, fontWeight: FontWeight.bold, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
          ),
        ),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (item['category'] != null)
              Text(item['category'], style: TextStyle(fontSize: 10, color: Colors.grey.shade400)),
            const SizedBox(height: 4),
            Row(
              children: [
                if (!isProduct)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    margin: const EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(color: const Color(0xFF003366).withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                    child: Text(
                      type.replaceFirst('service_', '').replaceFirst('design_', '').toUpperCase(), 
                      style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFF003366))
                    ),
                  ),
                Text(
                  item['price'] != null ? '৳${item['price']?.toString() ?? '0'}' : (isCategory ? 'EXPLORE CATEGORY' : 'REQUEST QUOTE'),
                  style: TextStyle(
                    color: item['price'] != null ? const Color(0xFF003366) : Colors.grey, 
                    fontWeight: item['price'] != null ? FontWeight.w900 : FontWeight.bold,
                    fontSize: 11
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
        onTap: () {
          _saveSearch(_controller.text);
          _handleItemTap(item);
        },
      ),
    );
  }

  Widget _buildSuggestionsList() {
    return ListView.builder(
      itemCount: _suggestions.length,
      itemBuilder: (context, index) {
        final item = _suggestions[index];
        final type = item['type']?.toString() ?? '';
        IconData iconData = Icons.history;
        if (type == 'product') iconData = Icons.shopping_bag_outlined;
        if (type.contains('service')) iconData = Icons.build_outlined;
        if (type.contains('design')) iconData = Icons.architecture_outlined;

        return ListTile(
          leading: Icon(iconData, color: Colors.grey, size: 20),
          title: Text(item['name'] ?? '', style: const TextStyle(fontSize: 14)),
          onTap: () {
            _controller.text = item['name'] ?? '';
            setState(() => _isShowingResults = true);
          },
        );
      },
    );
  }

  void _handleItemTap(Map<String, dynamic> item) {
    final type = item['type']?.toString() ?? '';
    if (type == 'product') {
       Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ProductDetailsScreen(
            product: Product(
              id: item['id']?.toString() ?? '',
              name: item['name']?.toString() ?? '',
              categoryId: item['category_id']?.toString() ?? 'search',
              price: (item['price'] ?? 0.0).toDouble(),
              imageUrl: item['image']?.toString(),
            ),
          ),
        ),
      );
    } else if (type == 'service_item') {
      // Navigate to Service Details (placeholder or specific screen if exists)
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Opening Service: ${item['name']}')));
    } else {
       // Category or Subcategory
       Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => CategoryListingScreen(
            category: Category(
              id: item['id'],
              name: item['name'],
              slug: item['name'].toString().toLowerCase(),
              type: type.contains('service') ? 'service' : (type.contains('design') ? 'design' : 'product'),
              level: 0,
            ),
          ),
        ),
      );
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: Colors.grey.shade50, shape: BoxShape.circle),
            child: Icon(Icons.search_rounded, size: 48, color: Colors.grey.shade300),
          ),
          const SizedBox(height: 16),
          Text(
            _controller.text.isEmpty ? 'Find products, services & designs' : 'No results found',
            style: const TextStyle(color: Colors.grey, fontSize: 14, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
