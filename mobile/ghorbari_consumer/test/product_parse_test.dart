import 'package:flutter_test/flutter_test.dart';
import 'package:ghorbari_consumer/shared/models/product.dart';

void main() {
  test('Parses Product from JSON', () {
    final Map<String, dynamic> rawJson = {
      "id": "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1",
      "seller_id": "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
      "category_id": "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1",
      "sku": "CEM-001",
      "title": "Portland Composite Cement",
      "description": null,
      "base_price": 520,
      "discount_price": null,
      "stock_quantity": 1000,
      "unit": "piece",
      "images": [
        "https://images.unsplash.com/photo-1574949955572-37e58c18bafb?w=600"
      ],
      "specifications": {},
      "status": "active",
      "created_at": "2026-02-07T16:32:22.857455+00:00",
      "updated_at": "2026-02-07T16:32:22.857455+00:00",
      "is_quote_only": false,
      "title_bn": null,
      "description_bn": null
    };

    final product = Product.fromJson(rawJson);
    print('Product successfully parsed: ${product.name}');
    print('Price: ${product.price}');
    print('Image URL: ${product.imageUrl}');
    expect(product.name, 'Portland Composite Cement');
    expect(product.price, 520.0);
  });
}
