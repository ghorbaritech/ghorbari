import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:intl/intl.dart';
import 'package:ghorbari_consumer/core/network/supabase_service.dart';
import 'package:ghorbari_consumer/features/design/presentation/widgets/checkbox_card_group.dart';
import 'package:ghorbari_consumer/features/design/presentation/widgets/radio_card_group.dart';
import 'package:ghorbari_consumer/features/design/presentation/widgets/wizard_step_indicator.dart';
import 'package:ghorbari_consumer/features/design/utils/design_translations.dart';

class DesignBookingWizardScreen extends StatefulWidget {
  final String? initialService;

  const DesignBookingWizardScreen({super.key, this.initialService});

  @override
  State<DesignBookingWizardScreen> createState() => _DesignBookingWizardScreenState();
}

// ─────────────────────────────────────────────
// Step Map (aligned with web page.tsx):
//  0 : Choose service type (Structural / Interior)
//  1 : Building Approval / Design / Both
//  2 : Unified Document Checklist (7 documents)
//  3 : Upload Documents (stub)
//  4 : Space Layout (land area, floors, # layouts)
//  5 : Plot Features (orientation, soil, roof)
//  6 : Design Aesthetics (structural vibe)
//  7 : Choose Designer Route (Ghorbari / List)
//  8 : Select Designer from List
//  9 : Property Type (interior)
// 10 : Interior Project Requirements
// 11 : Design Aesthetics (interior vibe)
// 12 : Choose Designer Route (interior path)
// 13 : Select Designer from List (interior path)
// 14 : Schedule
// 15 : Review & Confirm
// ─────────────────────────────────────────────

class _DesignBookingWizardScreenState extends State<DesignBookingWizardScreen> {
  late int step;
  late List<String> serviceTypes;
  bool loading = false;
  List<dynamic> designers = [];

  // Form State — Structural / Architectural
  String designerOption = ''; // 'approval' | 'design' | 'both'
  bool hasDeed = false;
  bool hasSurveyMap = false;
  bool hasMutation = false;
  bool hasTax = false;
  bool hasNID = false;
  bool hasLandPermit = false;
  bool hasBuildingApproval = false;

  String landAreaInput = '';
  String landAreaUnit = 'Katha'; // 'Katha' | 'sqft' | 'sqmeter'
  List<String> plotOrientation = [];
  String initialFloors = '';
  String numberOfLayouts = '1';
  String unitsPerFloor = '';
  String bedroomsPerUnit = '';
  String bathroomsPerUnit = '';
  String drawingRoomPerUnit = '';
  String kitchenPerUnit = '';
  String balconyPerUnit = '';
  String othersPerUnit = '';
  List<String> specialZones = [];
  String structuralVibe = '';
  String soilTest = '';
  List<String> roofFeatures = [];

  String designerSelectionType = ''; // 'ghorbari' | 'list'
  String? selectedDesignerId;

  // Form State — Interior
  String propertyType = ''; // 'Full building' | 'Full Apartment' | 'Specific Area'
  String houseType = ''; // 'Duplex' | 'Multistoried'
  String intFloors = '';
  String intUnitsPerFloor = '';
  String intAreaPerUnit = '';
  String aptSize = '';
  String aptRooms = '';
  String specificAreaType = '';
  String bedRoomType = '';
  String designScope = '';
  String roomSize = '';
  String specificInstruction = '';

  String preferredDate = '';
  String preferredTime = '';

  // Convenience getters
  bool get showsDesignQ => designerOption == 'design' || designerOption == 'both';
  bool get skippableListStep => designerSelectionType == 'ghorbari';

  @override
  void initState() {
    super.initState();
    step = widget.initialService == 'interior' ? 9 : (widget.initialService != null ? 1 : 0);
    serviceTypes = widget.initialService != null ? [widget.initialService!] : [];
    _fetchDesigners();
  }

  Future<void> _fetchDesigners() async {
    try {
      List<String> reqSpecs = [];
      if (serviceTypes.contains('structural-architectural')) reqSpecs.add('Structural & architectural');
      if (serviceTypes.contains('interior')) reqSpecs.add('Interior design');

      var query = SupabaseService.client.from('designers').select('*, profile:profiles(*)');

      if (reqSpecs.isNotEmpty) {
        query = query.overlaps('active_specializations', reqSpecs);
      }

      final data = await query;
      if (mounted) {
        setState(() {
          designers = data as List<dynamic>;
        });
      }
    } catch (e) {
      debugPrint("Error fetching designers: $e");
    }
  }

  void _updateServiceTypes(List<String> types) {
    setState(() {
      serviceTypes = types;
    });
    _fetchDesigners();
  }

  // ─── Dynamic step counting (matches web active steps) ───────────────────────

  List<int> _getActiveSteps() {
    final List<int> active = [0];
    if (serviceTypes.contains('structural-architectural')) {
      active.addAll([1, 2, 3]); // designer option, doc checklist, upload docs
      if (showsDesignQ) active.addAll([4, 5, 6]); // layout, plot, aesthetics
      active.add(7); // choose route
      if (!skippableListStep) active.add(8); // designer list
    }
    if (serviceTypes.contains('interior')) {
      active.addAll([9, 10, 11, 12]); // property type, requirements, vibe, route
      if (!skippableListStep) active.add(13); // designer list
    }
    active.addAll([14, 15]); // schedule, review
    return active;
  }

  int getDynamicTotalSteps() => _getActiveSteps().length;

  int getVisualStep() {
    final active = _getActiveSteps();
    final idx = active.indexOf(step);
    return idx >= 0 ? idx + 1 : 1;
  }

  // ─── Navigation ──────────────────────────────────────────────────────────────

  void nextStep() {
    setState(() {
      if (step == 0) {
        if (serviceTypes.contains('structural-architectural')) {
          step = 1;
        } else if (serviceTypes.contains('interior')) {
          step = 9;
        } else {
          step = 14;
        }
      }
      // Structural flow
      else if (step == 1) {
        step = 2; // Always go to unified document checklist (matches web)
      } else if (step == 2) {
        step = 3; // Upload documents
      } else if (step == 3) {
        if (showsDesignQ) {
          step = 4; // Space layout
        } else if (serviceTypes.contains('interior')) {
          step = 9; // Jump to interior flow
        } else {
          step = 7; // Jump to designer route
        }
      } else if (step == 4) {
        step = 5;
      } else if (step == 5) {
        step = 6;
      } else if (step == 6) {
        step = 7;
      } else if (step == 7) {
        if (skippableListStep) {
          if (serviceTypes.contains('interior')) {
            step = 9;
          } else {
            step = 14;
          }
        } else {
          step = 8;
        }
      } else if (step == 8) {
        if (serviceTypes.contains('interior')) {
          step = 9;
        } else {
          step = 14;
        }
      }
      // Interior flow
      else if (step == 9) {
        step = 10;
      } else if (step == 10) {
        step = 11;
      } else if (step == 11) {
        step = 12;
      } else if (step == 12) {
        if (skippableListStep) {
          step = 14;
        } else {
          step = 13;
        }
      } else if (step == 13) {
        step = 14;
      }
      // Shared end steps
      else if (step == 14) {
        step = 15;
      }
    });
  }

  void prevStep() {
    setState(() {
      if (step == 1) {
        step = 0;
      } else if (step == 2) {
        step = 1;
      } else if (step == 3) {
        step = 2;
      } else if (step == 4) {
        step = 3;
      } else if (step == 5) {
        step = 4;
      } else if (step == 6) {
        step = 5;
      } else if (step == 7) {
        if (showsDesignQ) {
          step = 6;
        } else {
          step = 3;
        }
      } else if (step == 8) {
        step = 7;
      } else if (step == 9) {
        if (serviceTypes.contains('structural-architectural')) {
          if (skippableListStep) step = 7; else step = 8;
        } else {
          step = 0;
        }
      } else if (step == 10) {
        step = 9;
      } else if (step == 11) {
        step = 10;
      } else if (step == 12) {
        step = 11;
      } else if (step == 13) {
        step = 12;
      } else if (step == 14) {
        if (serviceTypes.contains('interior')) {
          if (skippableListStep) step = 12; else step = 13;
        } else if (serviceTypes.contains('structural-architectural')) {
          if (skippableListStep) step = 7; else step = 8;
        } else {
          step = 0;
        }
      } else if (step == 15) {
        step = 14;
      }
    });
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  Future<void> handleSubmit() async {
    setState(() => loading = true);
    try {
      final user = SupabaseService.client.auth.currentUser;
      if (user == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please login to continue.')),
          );
        }
        return;
      }

      int tentativePrice = 0;
      if (serviceTypes.contains('structural-architectural')) {
        if (designerSelectionType == 'ghorbari') {
          if (designerOption == 'both') tentativePrice = 80000;
          else if (designerOption == 'design') tentativePrice = 50000;
          else tentativePrice = 30000;
        } else {
          tentativePrice = 60000;
        }
      }
      if (serviceTypes.contains('interior')) {
        tentativePrice += 20000;
      }

      final payloadDetails = {
        'designerOption': designerOption,
        'hasDeed': hasDeed,
        'hasSurveyMap': hasSurveyMap,
        'hasMutation': hasMutation,
        'hasTax': hasTax,
        'hasNID': hasNID,
        'hasLandPermit': hasLandPermit,
        'hasBuildingApproval': hasBuildingApproval,
        'buildingDetails': {
          'landArea': landAreaInput,
          'landAreaUnit': landAreaUnit,
          'floors': initialFloors,
          'numberOfLayouts': numberOfLayouts,
          'unitsPerFloor': unitsPerFloor,
          'bedroomsPerUnit': bedroomsPerUnit,
          'bathroomsPerUnit': bathroomsPerUnit,
          'drawingRoomPerUnit': drawingRoomPerUnit,
          'kitchenPerUnit': kitchenPerUnit,
          'balconyPerUnit': balconyPerUnit,
          'othersPerUnit': othersPerUnit,
        },
        'plotOrientation': plotOrientation,
        'specialZones': specialZones,
        'structuralVibe': structuralVibe,
        'soilTest': soilTest,
        'roofFeatures': roofFeatures,
        'designerSelectionType': designerSelectionType,
        'selectedDesignerId': selectedDesignerId,
        'propertyType': propertyType,
        'houseType': houseType,
        'intFloors': intFloors,
        'intUnitsPerFloor': intUnitsPerFloor,
        'intAreaPerUnit': intAreaPerUnit,
        'aptSize': aptSize,
        'aptRooms': aptRooms,
        'specificAreaType': specificAreaType,
        'bedRoomType': bedRoomType,
        'designScope': designScope,
        'roomSize': roomSize,
        'specificInstruction': specificInstruction,
        'tentativePrice': tentativePrice,
        'preferredSchedule': {
          'date': preferredDate,
          'time': preferredTime,
        }
      };

      await SupabaseService.client.from('design_bookings').insert({
        'user_id': user.id,
        'service_type': serviceTypes.contains('structural-architectural') ? 'architectural' : 'interior',
        'status': 'pending',
        'details': payloadDetails
      });

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Design booking created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      debugPrint("Submit Error: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => loading = false);
      }
    }
  }

  // ─── Build ───────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
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
        leading: step > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: prevStep,
              )
            : const BackButton(),
      ),
      body: Column(
        children: [
          WizardStepIndicator(
            currentStep: getVisualStep(),
            totalSteps: getDynamicTotalSteps(),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              child: _buildStepContent(),
            ),
          ),
          _buildBottomAction(),
        ],
      ),
    );
  }

  // ─── Step Content ─────────────────────────────────────────────────────────────

  Widget _buildStepContent() {
    final lang = context.locale.languageCode;
    String tr(String key) => DesignTranslations.tr(key, lang);
    final primaryColor = const Color(0xFFC2410C);

    // ── Step 0: Choose Service Type ─────────────────────────────────────────
    if (step == 0) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('startJourneyTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('startJourneyDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          CheckboxCardGroup(
            options: [
              CheckboxCardOption(
                id: 'structural-architectural',
                label: tr('structuralService'),
                description: tr('structuralServiceDesc'),
                icon: Icons.domain,
              ),
              CheckboxCardOption(
                id: 'interior',
                label: tr('interiorService'),
                description: tr('interiorServiceDesc'),
                icon: Icons.format_paint,
              ),
            ],
            selectedIds: serviceTypes,
            onChanged: _updateServiceTypes,
            columns: 1,
          ),
        ],
      );
    }

    // ── Step 1: Building Approval / Design / Both ────────────────────────────
    if (step == 1) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('findDesignerTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('findDesignerDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          RadioCardGroup(
            options: [
              RadioCardOption(id: 'approval', label: tr('buildingApproval'), description: tr('buildingApprovalDesc'), icon: Icons.verified),
              RadioCardOption(id: 'design', label: tr('buildingDesign'), description: tr('buildingDesignDesc'), icon: Icons.architecture),
              RadioCardOption(id: 'both', label: tr('bothApprovalDesign'), description: tr('bothApprovalDesignDesc'), icon: Icons.business),
            ],
            selectedId: designerOption,
            onChanged: (val) => setState(() => designerOption = val),
          ),
        ],
      );
    }

    // ── Step 2: Unified Document Checklist (all 7 docs — matches web step 2) ─
    if (step == 2) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('docChecklistTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('docChecklistDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          _buildDocCheckItem(tr('deedDoc'), tr('deedDocDesc'), hasDeed, (v) => setState(() => hasDeed = v), primaryColor),
          _buildDocCheckItem(tr('surveyMap'), tr('surveyMapDesc'), hasSurveyMap, (v) => setState(() => hasSurveyMap = v), primaryColor),
          _buildDocCheckItem(tr('mutation'), tr('mutationDesc'), hasMutation, (v) => setState(() => hasMutation = v), primaryColor),
          _buildDocCheckItem(tr('tax'), tr('taxDesc'), hasTax, (v) => setState(() => hasTax = v), primaryColor),
          _buildDocCheckItem(tr('nid'), tr('nidDesc'), hasNID, (v) => setState(() => hasNID = v), primaryColor),
          _buildDocCheckItem(tr('landPermit'), tr('landPermitDesc'), hasLandPermit, (v) => setState(() => hasLandPermit = v), primaryColor),
          _buildDocCheckItem(tr('buildingApprovalDoc'), tr('buildingApprovalDocDesc'), hasBuildingApproval, (v) => setState(() => hasBuildingApproval = v), primaryColor),
        ],
      );
    }

    // ── Step 3: Upload Documents (matches web step 3) ────────────────────────
    if (step == 3) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('uploadDocsTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('uploadDocsDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Document upload will be available soon.')),
              );
            },
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                border: Border.all(color: Colors.grey.shade300, width: 2, strokeAlign: BorderSide.strokeAlignInside),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 8)],
                    ),
                    child: const Icon(Icons.upload_file, size: 32, color: Color(0xFFC2410C)),
                  ),
                  const SizedBox(height: 16),
                  const Text('UPLOAD DOCUMENTS',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.2, color: Color(0xFF0F172A))),
                  const SizedBox(height: 4),
                  Text('Max file size: 10MB', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                  const SizedBox(height: 8),
                  Text('Tap to browse files', style: TextStyle(fontSize: 12, color: Colors.grey.shade400)),
                ],
              ),
            ),
          ),
        ],
      );
    }

    // ── Step 4: Space Layout (land area + unit selector, floors, # layouts) ──
    if (step == 4) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('spaceLayoutTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('spaceLayoutDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          // Land area with unit selector (matches web step 4)
          Text(tr('landAreaQ'), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF334155))),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  onChanged: (v) => setState(() => landAreaInput = v),
                  keyboardType: TextInputType.number,
                  controller: TextEditingController(text: landAreaInput)..selection = TextSelection.collapsed(offset: landAreaInput.length),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.grey.shade50,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade200)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade200)),
                    hintText: 'e.g. 5',
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  border: Border.all(color: Colors.grey.shade200),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: landAreaUnit,
                    items: ['Katha', 'sqft', 'sqmeter'].map((u) => DropdownMenuItem(value: u, child: Text(u))).toList(),
                    onChanged: (v) => setState(() => landAreaUnit = v ?? 'Katha'),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildTextField(tr('floorsQ'), initialFloors, (v) => setState(() => initialFloors = v), keyboardType: TextInputType.number),
          _buildTextField(tr('numLayoutsQ'), numberOfLayouts, (v) => setState(() => numberOfLayouts = v), keyboardType: TextInputType.number),
          const Divider(height: 40),
          Text(tr('unitsQ'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildTextField(tr('unitsQ'), unitsPerFloor, (v) => setState(() => unitsPerFloor = v), keyboardType: TextInputType.number),
          _buildTextField(tr('bedsQ'), bedroomsPerUnit, (v) => setState(() => bedroomsPerUnit = v), keyboardType: TextInputType.number),
          _buildTextField(tr('bathsQ'), bathroomsPerUnit, (v) => setState(() => bathroomsPerUnit = v), keyboardType: TextInputType.number),
          _buildTextField(tr('drawingQ'), drawingRoomPerUnit, (v) => setState(() => drawingRoomPerUnit = v), keyboardType: TextInputType.number),
          _buildTextField(tr('kitchenQ'), kitchenPerUnit, (v) => setState(() => kitchenPerUnit = v), keyboardType: TextInputType.number),
          _buildTextField(tr('balconyQ'), balconyPerUnit, (v) => setState(() => balconyPerUnit = v), keyboardType: TextInputType.number),
          _buildTextField(tr('othersQ'), othersPerUnit, (v) => setState(() => othersPerUnit = v)),
        ],
      );
    }

    // ── Step 5: Plot Features (orientation, soil test, roof features) ─────────
    if (step == 5) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('plotFeaturesTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('plotFeaturesDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          Text(tr('orientationQ'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ['North', 'South', 'East', 'West'].map((o) => ChoiceChip(
              label: Text(tr(o)),
              selected: plotOrientation.contains(o),
              onSelected: (s) => setState(() { s ? plotOrientation.add(o) : plotOrientation.remove(o); }),
              selectedColor: primaryColor.withOpacity(0.2),
            )).toList(),
          ),
          const SizedBox(height: 24),
          Text(tr('roofFeaturesQ'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ['Roof garden', 'Swimming pool'].map((o) => ChoiceChip(
              label: Text(tr(o)),
              selected: roofFeatures.contains(o),
              onSelected: (s) => setState(() { s ? roofFeatures.add(o) : roofFeatures.remove(o); }),
              selectedColor: primaryColor.withOpacity(0.2),
            )).toList(),
          ),
          const SizedBox(height: 24),
          Text(tr('soilTestQ'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          RadioCardGroup(
            options: [
              RadioCardOption(id: 'Yes', label: tr('yes')),
              RadioCardOption(id: 'No', label: tr('no')),
            ],
            selectedId: soilTest,
            onChanged: (v) => setState(() => soilTest = v),
            columns: 2,
          ),
        ],
      );
    }

    // ── Step 6: Design Aesthetics (structural) ───────────────────────────────
    if (step == 6) {
      return _buildAestheticsStep(tr, primaryColor);
    }

    // ── Step 7: Choose Designer Route (structural path) ──────────────────────
    if (step == 7) {
      return _buildDesignerRouteStep(tr);
    }

    // ── Step 8: Select Designer (structural path) ────────────────────────────
    if (step == 8) {
      return _buildDesignerListStep(tr, primaryColor);
    }

    // ── Step 9: Property Type (interior) ────────────────────────────────────
    if (step == 9) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('propertyType'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('startJourneyDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          RadioCardGroup(
            options: [
              RadioCardOption(id: 'Full building', label: tr('fullBuilding'), icon: Icons.location_city),
              RadioCardOption(id: 'Full Apartment', label: tr('fullApt'), icon: Icons.home),
              RadioCardOption(id: 'Specific Area', label: tr('specificArea'), icon: Icons.bed),
            ],
            selectedId: propertyType,
            onChanged: (v) => setState(() { propertyType = v; }),
          ),
        ],
      );
    }

    // ── Step 10: Interior Project Requirements ───────────────────────────────
    if (step == 10) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('projectReqs'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('spaceLayoutDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),

          if (propertyType == 'Full building') ...[
            Text(tr('typeOfHouse'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            RadioCardGroup(
              options: [
                RadioCardOption(id: 'Duplex', label: tr('Duplex')),
                RadioCardOption(id: 'Multistoried', label: tr('Multistoried')),
              ],
              selectedId: houseType,
              onChanged: (v) => setState(() => houseType = v),
              columns: 2,
            ),
            const SizedBox(height: 24),
            _buildTextField(tr('numFloors'), intFloors, (v) => setState(() => intFloors = v), keyboardType: TextInputType.number),
            _buildTextField(tr('unitsEachFloor'), intUnitsPerFloor, (v) => setState(() => intUnitsPerFloor = v), keyboardType: TextInputType.number),
            _buildTextField(tr('areaEachUnit'), intAreaPerUnit, (v) => setState(() => intAreaPerUnit = v), keyboardType: TextInputType.number),
          ],

          if (propertyType == 'Full Apartment') ...[
            _buildTextField(tr('aptSize'), aptSize, (v) => setState(() => aptSize = v), keyboardType: TextInputType.number),
            _buildTextField(tr('noOfRoom'), aptRooms, (v) => setState(() => aptRooms = v), keyboardType: TextInputType.number),
          ],

          if (propertyType == 'Specific Area') ...[
            Text(tr('specificArea'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            RadioCardGroup(
              options: [
                RadioCardOption(id: 'Living Room', label: tr('livingRoom')),
                RadioCardOption(id: 'Drawing Room', label: tr('drawingRoom')),
                RadioCardOption(id: 'Bed Room', label: tr('bedRoom')),
                RadioCardOption(id: 'Bath Room', label: tr('bathRoom')),
                RadioCardOption(id: 'Kitchen', label: tr('kitchen')),
                RadioCardOption(id: 'Balcony', label: tr('balcony')),
                RadioCardOption(id: 'Rooftop', label: tr('rooftop')),
                RadioCardOption(id: 'Entrance', label: tr('entrance')),
              ],
              selectedId: specificAreaType,
              onChanged: (v) => setState(() => specificAreaType = v),
              columns: 2,
            ),
            const SizedBox(height: 24),

            if (specificAreaType == 'Bed Room') ...[
              Text(tr('bedRoom'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              RadioCardGroup(
                options: [
                  RadioCardOption(id: 'Master Bedroom', label: tr('masterBed')),
                  RadioCardOption(id: 'General Bedroom', label: tr('generalBed')),
                  RadioCardOption(id: 'Welcome Newborn', label: tr('welcomeNewborn')),
                  RadioCardOption(id: 'Teenagers Special', label: tr('teenagersSpecial')),
                  RadioCardOption(id: 'Children Bedroom', label: tr('childrenBed')),
                ],
                selectedId: bedRoomType,
                onChanged: (v) => setState(() => bedRoomType = v),
                columns: 2,
              ),
              const SizedBox(height: 24),
            ],

            Text('Design Scope', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            RadioCardGroup(
              options: [
                RadioCardOption(id: 'Entire New Design', label: tr('entireNewDesign')),
                RadioCardOption(id: 'Specific Renovation', label: tr('specificRenovation')),
              ],
              selectedId: designScope,
              onChanged: (v) => setState(() => designScope = v),
              columns: 2,
            ),
            const SizedBox(height: 24),
            _buildTextField(tr('roomSize'), roomSize, (v) => setState(() => roomSize = v), keyboardType: TextInputType.number),
            _buildTextField(tr('anyInstruction'), specificInstruction, (v) => setState(() => specificInstruction = v)),
          ],
        ],
      );
    }

    // ── Step 11: Design Aesthetics (interior vibe) ───────────────────────────
    if (step == 11) {
      return _buildAestheticsStep(tr, primaryColor);
    }

    // ── Step 12: Choose Designer Route (interior path) ───────────────────────
    if (step == 12) {
      return _buildDesignerRouteStep(tr);
    }

    // ── Step 13: Select Designer (interior path) ─────────────────────────────
    if (step == 13) {
      return _buildDesignerListStep(tr, primaryColor);
    }

    // ── Step 14: Schedule ─────────────────────────────────────────────────────
    if (step == 14) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('scheduleTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('scheduleDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          ListTile(
            title: Text(preferredDate.isEmpty ? tr('prefDateLabel') : preferredDate),
            trailing: const Icon(Icons.calendar_today),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
              side: BorderSide(color: Colors.grey.shade300),
            ),
            onTap: () async {
              final d = await showDatePicker(
                context: context,
                initialDate: DateTime.now(),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 365)),
              );
              if (d != null) {
                setState(() => preferredDate = '${d.day}/${d.month}/${d.year}');
              }
            },
          ),
          const SizedBox(height: 16),
          // Time Slots Grid (matches web's 3-column grid)
          Text(tr('prefTimeLabel'), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF334155))),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 2.2,
            children: [
              '09:00 AM', '10:00 AM', '11:00 AM',
              '12:00 PM', '01:00 PM', '02:00 PM',
              '03:00 PM', '04:00 PM', '05:00 PM',
              '06:00 PM', '07:00 PM', '08:00 PM',
              '09:00 PM', '10:00 PM', '11:00 PM',
            ].map((time) {
              final isSelected = preferredTime == time;
              return GestureDetector(
                onTap: () => setState(() => preferredTime = time),
                child: Container(
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF0F172A) : Colors.white,
                    border: Border.all(
                      color: isSelected ? const Color(0xFF0F172A) : Colors.grey.shade300,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    time,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : Colors.black87,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      );
    }

    // ── Step 15: Review & Confirm ─────────────────────────────────────────────
    if (step == 15) {
      int price = 0;
      if (serviceTypes.contains('structural-architectural')) {
        if (designerSelectionType == 'ghorbari') {
          if (designerOption == 'both') price = 80000;
          else if (designerOption == 'design') price = 50000;
          else price = 30000;
        } else {
          price = 60000;
        }
      }
      if (serviceTypes.contains('interior')) price += 20000;

      final lang = context.locale.languageCode;
      String trKey(String key) => DesignTranslations.tr(key, lang);

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(trKey('reviewTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(trKey('reviewDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey.shade200),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12)],
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(trKey('tentativeQuote'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          Text(trKey('statusWait'), style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('৳ ${NumberFormat('#,##,###').format(price)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: Color(0xFFC2410C))),
                        Text(trKey('startingPrice'), style: TextStyle(color: Colors.grey.shade500, fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
                const Divider(height: 32),
                _reviewRow(trKey('serviceArea'), serviceTypes.join(', ').replaceAll('structural-architectural', 'Structural')),
                const SizedBox(height: 12),
                _reviewRow(trKey('prefDateLabel'), '$preferredDate${preferredTime.isNotEmpty ? ' | $preferredTime' : ''}'),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFFFFBEB),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFFDE68A)),
            ),
            child: const Text(
              'Note: Final cost may vary based on actual measurements and scope defined during site visit. No upfront payment required.',
              style: TextStyle(fontSize: 12, color: Color(0xFF78350F), height: 1.5),
            ),
          ),
        ],
      );
    }

    // Default Fallback
    return const Center(child: Text("Step Content Under Construction"));
  }

  // ─── Reusable step widgets ───────────────────────────────────────────────────

  Widget _buildAestheticsStep(String Function(String) tr, Color primaryColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(tr('aestheticsTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text(tr('aestheticsDesc'), style: TextStyle(color: Colors.grey.shade600)),
        const SizedBox(height: 32),
        RadioCardGroup(
          options: [
            RadioCardOption(id: 'Modern', label: tr('Modern')),
            RadioCardOption(id: 'Traditional', label: tr('Traditional')),
            RadioCardOption(id: 'Luxury', label: tr('Luxury')),
            RadioCardOption(id: 'Eco', label: tr('Eco')),
          ],
          selectedId: structuralVibe,
          onChanged: (v) => setState(() => structuralVibe = v),
          columns: 2,
        ),
      ],
    );
  }

  Widget _buildDesignerRouteStep(String Function(String) tr) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(tr('chooseRouteTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text(tr('chooseRouteDesc'), style: TextStyle(color: Colors.grey.shade600)),
        const SizedBox(height: 32),
        RadioCardGroup(
          options: [
            RadioCardOption(id: 'ghorbari', label: tr('suggestedOption'), description: tr('suggestedOptionDesc'), icon: Icons.person),
            RadioCardOption(id: 'list', label: tr('listOption'), description: tr('listOptionDesc'), icon: Icons.star),
          ],
          selectedId: designerSelectionType,
          onChanged: (v) => setState(() => designerSelectionType = v),
        ),
      ],
    );
  }

  Widget _buildDesignerListStep(String Function(String) tr, Color primaryColor) {
    if (designers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(height: 64),
            Icon(Icons.person_off, size: 64, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text(tr('noDesigners'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(tr('selectDesignerTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text(tr('selectDesignerDesc'), style: TextStyle(color: Colors.grey.shade600)),
        const SizedBox(height: 32),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: designers.length,
          separatorBuilder: (_, __) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            final d = designers[index];
            final isSelected = selectedDesignerId == d['id'];
            return GestureDetector(
              onTap: () => setState(() => selectedDesignerId = d['id']),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isSelected ? primaryColor.withOpacity(0.05) : Colors.white,
                  border: Border.all(color: isSelected ? primaryColor : Colors.grey.shade200, width: isSelected ? 2 : 1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundImage: d['profile']?['avatar_url'] != null ? NetworkImage(d['profile']['avatar_url']) : null,
                      child: d['profile']?['avatar_url'] == null ? const Icon(Icons.person) : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(d['company_name'] ?? d['contact_person_name'] ?? 'Designer',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 4),
                          Text(
                            d['experience_years'] != null ? '${d['experience_years']} ${tr('yearsExp')}' : tr('verifiedExpert'),
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? primaryColor : Colors.black,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        isSelected ? tr('selected') : tr('bookNow'),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildDocCheckItem(String title, String subtitle, bool value, ValueChanged<bool> onChanged, Color primaryColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: CheckboxListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
        value: value,
        onChanged: (v) => onChanged(v ?? false),
        activeColor: primaryColor,
        contentPadding: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _reviewRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade500)),
        Flexible(
          child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)), textAlign: TextAlign.end),
        ),
      ],
    );
  }

  Widget _buildTextField(String label, String value, Function(String) onChanged, {TextInputType keyboardType = TextInputType.text}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF334155))),
          const SizedBox(height: 8),
          TextField(
            onChanged: onChanged,
            keyboardType: keyboardType,
            decoration: InputDecoration(
              filled: true,
              fillColor: Colors.grey.shade50,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade200)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade200)),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Bottom Action Bar ────────────────────────────────────────────────────────

  Widget _buildBottomAction() {
    final lang = context.locale.languageCode;
    String trKey(String key) => DesignTranslations.tr(key, lang);

    bool canNext = false;
    switch (step) {
      case 0:  canNext = serviceTypes.isNotEmpty; break;
      case 1:  canNext = designerOption.isNotEmpty; break;
      case 2:  canNext = true; break; // Checklist — always can continue
      case 3:  canNext = true; break; // Upload docs — optional
      case 4:  canNext = landAreaInput.isNotEmpty && initialFloors.isNotEmpty; break;
      case 5:  canNext = true; break; // Plot features optional
      case 6:  canNext = structuralVibe.isNotEmpty; break;
      case 7:  canNext = designerSelectionType.isNotEmpty; break;
      case 8:  canNext = selectedDesignerId != null; break;
      case 9:  canNext = propertyType.isNotEmpty; break;
      case 10:
        if (propertyType == 'Full building') canNext = houseType.isNotEmpty && intFloors.isNotEmpty;
        else if (propertyType == 'Full Apartment') canNext = aptSize.isNotEmpty && aptRooms.isNotEmpty;
        else if (propertyType == 'Specific Area') canNext = specificAreaType.isNotEmpty && (specificAreaType != 'Bed Room' || bedRoomType.isNotEmpty) && designScope.isNotEmpty && roomSize.isNotEmpty;
        else canNext = true;
        break;
      case 11: canNext = structuralVibe.isNotEmpty; break;
      case 12: canNext = designerSelectionType.isNotEmpty; break;
      case 13: canNext = selectedDesignerId != null; break;
      case 14: canNext = preferredDate.isNotEmpty && preferredTime.isNotEmpty; break;
      case 15: canNext = true; break;
    }

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
      ),
      child: SafeArea(
        top: false,
        child: ElevatedButton(
          onPressed: canNext ? (step == 15 ? handleSubmit : nextStep) : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0F172A),
            disabledBackgroundColor: Colors.grey.shade300,
            minimumSize: const Size(double.infinity, 54),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: loading
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Text(
                  step == 15 ? trKey('completeBooking') : trKey('continue_btn'),
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
        ),
      ),
    );
  }
}
