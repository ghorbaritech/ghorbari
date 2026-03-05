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

class _DesignBookingWizardScreenState extends State<DesignBookingWizardScreen> {
  late int step;
  late List<String> serviceTypes;
  bool loading = false;
  List<dynamic> designers = [];

  // Form State
  String designerOption = '';
  bool hasDeed = false;
  bool hasSurveyMap = false;
  bool hasMutation = false;
  bool hasTax = false;
  bool hasNID = false;
  bool hasLandPermit = false;
  bool hasBuildingApproval = false;

  String landAreaKatha = '';
  List<String> plotOrientation = [];
  String initialFloors = '';
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

  String designerSelectionType = '';
  String? selectedDesignerId;

  // Interior - Setup
  String propertyType = ''; 

  // Full House
  String houseType = ''; 
  String intFloors = '';
  String intUnitsPerFloor = '';
  String intAreaPerUnit = '';

  // Full Apartment
  String aptSize = '';
  String aptRooms = '';
  // File variables would go here if we implemented file upload natively

  // Specific Area
  String specificAreaType = '';
  String bedRoomType = '';
  String designScope = '';
  String roomSize = '';
  String specificInstruction = '';
  
  String preferredDate = '';
  String preferredTime = '';

  @override
  void initState() {
    super.initState();
    step = widget.initialService == 'interior' ? 8 : (widget.initialService != null ? 1 : 0);
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
      setState(() {
        designers = data as List<dynamic>;
      });
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

  bool get showsDesignQ => designerOption == 'design' || designerOption == 'both';
  bool get skippableListStep => designerSelectionType == 'ghorbari';

  int getDynamicTotalSteps() {
    int total = 1;
    if (serviceTypes.contains('structural-architectural')) {
      int structuralTotal = 6;
      if (!showsDesignQ) structuralTotal -= 3;
      if (skippableListStep) structuralTotal -= 1;
      total += structuralTotal;
    }
    if (serviceTypes.contains('interior')) {
      total += 3;
    }
    total += 2;
    return total;
  }

  int getVisualStep() {
    int visual = 0;
    if (step == 0) return 1;

    visual = 2; // Step 0 is step 1
    if (step >= 1 && step <= 7) {
      int structuralVisual = step;
      if (!showsDesignQ && step > 2) structuralVisual -= 3;
      if (skippableListStep && step > 6) structuralVisual -= 1;
      return visual + structuralVisual - 1;
    }

    if (serviceTypes.contains('structural-architectural')) {
      int structuralSteps = 6;
      if (!showsDesignQ) structuralSteps -= 3;
      if (skippableListStep) structuralSteps -= 1;
      visual += structuralSteps;
    }

    if (step >= 8 && step <= 11) {
      return visual + (step - 8);
    }

    if (serviceTypes.contains('interior')) {
      visual += 3;
    }

    if (step == 12) return visual;
    if (step == 13) return visual + 1;

    return visual;
  }

  void nextStep() {
    setState(() {
      if (step == 0) {
        if (serviceTypes.contains('structural-architectural')) {
          step = 1;
        } else if (serviceTypes.contains('interior')) {
          step = 8;
        } else {
          step = 12;
        }
      } else if (step >= 1 && step <= 7) {
        if (step == 1) step = 2;
        else if (step == 2) {
          if (showsDesignQ) step = 3; else step = 6;
        }
        else if (step == 3) step = 4;
        else if (step == 4) step = 5;
        else if (step == 5) step = 6;
        else if (step == 6) {
          if (skippableListStep) {
            if (serviceTypes.contains('interior')) step = 8; else step = 12;
          } else {
            step = 7;
          }
        }
        else if (step == 7) {
          if (serviceTypes.contains('interior')) step = 8; else step = 12;
        }
      } else if (step >= 8 && step <= 11) {
        if (step == 8) step = 9;
        else if (step == 9) step = 10;
        else if (step == 10) step = 11;
        else if (step == 11) step = 12;
      } else if (step == 12) {
        step = 13;
      }
    });
  }

  void prevStep() {
    setState(() {
      if (step == 1) step = 0;
      else if (step > 1 && step <= 7) {
        if (step == 6 && !showsDesignQ) step = 2;
        else if (step == 7) step = 6;
        else step = step - 1;
      } else if (step == 8) {
        if (serviceTypes.contains('structural-architectural')) {
          if (skippableListStep) step = 6; else step = 7;
        } else {
          step = 0;
        }
      } else if (step > 8 && step <= 11) {
        step = step - 1;
      } else if (step == 12) {
        if (serviceTypes.contains('interior')) step = 11;
        else if (serviceTypes.contains('structural-architectural')) {
          if (skippableListStep) step = 6; else step = 7;
        } else {
          step = 0;
        }
      } else if (step == 13) {
        step = 12;
      }
    });
  }

  Future<void> handleSubmit() async {
    setState(() => loading = true);
    try {
      final user = SupabaseService.client.auth.currentUser;
      if (user == null) {
        // Handle unauthenticated case appropriately
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please login to continue.')),
        );
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
        'landAreaKatha': landAreaKatha,
        'plotOrientation': plotOrientation,
        'initialFloors': initialFloors,
        'unitsPerFloor': unitsPerFloor,
        'bedroomsPerUnit': bedroomsPerUnit,
        'bathroomsPerUnit': bathroomsPerUnit,
        'drawingRoomPerUnit': drawingRoomPerUnit,
        'kitchenPerUnit': kitchenPerUnit,
        'balconyPerUnit': balconyPerUnit,
        'othersPerUnit': othersPerUnit,
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
        Navigator.pop(context); // Pop wizard
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Design booking created successfully!'), backgroundColor: Colors.green),
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

  // UI Building Methods...
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
        leading: step > 0 && widget.initialService == null ? IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: prevStep,
        ) : widget.initialService != null && step > 0 && !(step == 1 && widget.initialService == 'structural-architectural') && !(step == 8 && widget.initialService == 'interior')
          ? IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: prevStep,
          ) : const BackButton(),
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

  Widget _buildStepContent() {
    final lang = context.locale.languageCode;
    String tr(String key) => DesignTranslations.tr(key, lang);
    final primaryColor = const Color(0xFFC2410C);

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

    if (step == 2) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('docChecklistTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('docChecklistDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          if (designerOption == 'approval' || designerOption == 'both') ...[
            Text(tr('approvalDocs'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            CheckboxListTile(
              title: Text(tr('deedDoc'), style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(tr('deedDocDesc')),
              value: hasDeed,
              onChanged: (v) => setState(() => hasDeed = v ?? false),
              activeColor: primaryColor,
              contentPadding: EdgeInsets.zero,
            ),
            CheckboxListTile(
              title: Text(tr('surveyMap'), style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(tr('surveyMapDesc')),
              value: hasSurveyMap,
              onChanged: (v) => setState(() => hasSurveyMap = v ?? false),
              activeColor: primaryColor,
              contentPadding: EdgeInsets.zero,
            ),
            CheckboxListTile(
              title: Text(tr('mutation'), style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(tr('mutationDesc')),
              value: hasMutation,
              onChanged: (v) => setState(() => hasMutation = v ?? false),
              activeColor: primaryColor,
              contentPadding: EdgeInsets.zero,
            ),
            CheckboxListTile(
              title: Text(tr('tax'), style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(tr('taxDesc')),
              value: hasTax,
              onChanged: (v) => setState(() => hasTax = v ?? false),
              activeColor: primaryColor,
              contentPadding: EdgeInsets.zero,
            ),
            CheckboxListTile(
              title: Text(tr('nid'), style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(tr('nidDesc')),
              value: hasNID,
              onChanged: (v) => setState(() => hasNID = v ?? false),
              activeColor: primaryColor,
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 24),
          ],
          if (designerOption == 'design' || designerOption == 'both') ...[
            Text(tr('designDocs'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            CheckboxListTile(
              title: Text(tr('landPermit'), style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(tr('landPermitDesc')),
              value: hasLandPermit,
              onChanged: (v) => setState(() => hasLandPermit = v ?? false),
              activeColor: primaryColor,
              contentPadding: EdgeInsets.zero,
            ),
            CheckboxListTile(
              title: Text(tr('buildingApprovalDoc'), style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(tr('buildingApprovalDocDesc')),
              value: hasBuildingApproval,
              onChanged: (v) => setState(() => hasBuildingApproval = v ?? false),
              activeColor: primaryColor,
              contentPadding: EdgeInsets.zero,
            ),
          ]
        ],
      );
    }

    if (step == 3) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('spaceLayoutTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('spaceLayoutDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          _buildTextField(tr('landAreaQ'), landAreaKatha, (v) => setState(() => landAreaKatha = v), keyboardType: TextInputType.number),
          _buildTextField(tr('floorsQ'), initialFloors, (v) => setState(() => initialFloors = v), keyboardType: TextInputType.number),
          const Divider(height: 48),
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
    
    if (step == 4) {
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
          Text(tr('specialZonesQ'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ['Prayer room', 'Home Office', 'Maid\'s room', 'Parking'].map((o) => ChoiceChip(
              label: Text(tr(o)),
              selected: specialZones.contains(o),
              onSelected: (s) => setState(() { s ? specialZones.add(o) : specialZones.remove(o); }),
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
              RadioCardOption(id: 'yes', label: tr('yes')),
              RadioCardOption(id: 'no', label: tr('no')),
            ],
            selectedId: soilTest,
            onChanged: (v) => setState(() => soilTest = v),
          ),
        ],
      );
    }
    
    if (step == 5 || step == 10) {
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

    if (step == 6 || step == 11) {
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
    
    if (step == 7) {
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
                            Text(d['company_name'] ?? d['contact_person_name'] ?? 'Designer', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(height: 4),
                            Text(d['experience_years'] != null ? '${d['experience_years']} ${tr('yearsExp')}' : tr('verifiedExpert'), style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? primaryColor : Colors.black,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(isSelected ? tr('selected') : tr('bookNow'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                      )
                    ],
                  ),
                ),
              );
            },
          )
        ],
      );
    }
    
    if (step == 8) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('startJourneyTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
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
    
    if (step == 9) {
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
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'Living Room', 'Drawing Room', 'Bed Room', 'Bath Room',
                'Kitchen', 'Balcony', 'Rooftop', 'Entrance'
              ].map((o) => ChoiceChip(
                label: Text(tr(o.replaceAll(' ', '').toLowerCase())), // Attempt simple mapping or fallback
                selected: specificAreaType == o,
                onSelected: (s) => setState(() { if(s) specificAreaType = o; }),
                selectedColor: primaryColor.withOpacity(0.2),
              )).toList(),
            ),
            const SizedBox(height: 24),
            
            if (specificAreaType == 'Bed Room') ...[
              Text(tr('bedRoom'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  'Master Bedroom', 'General Bedroom', 'Welcome Newborn',
                  'Teenagers Special', 'Children Bedroom'
                ].map((o) => ChoiceChip(
                  label: Text(o), // Fallback map
                  selected: bedRoomType == o,
                  onSelected: (s) => setState(() { if(s) bedRoomType = o; }),
                  selectedColor: primaryColor.withOpacity(0.2),
                )).toList(),
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
          ]
        ],
      );
    }
    
    if (step == 12) {
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
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide(color: Colors.grey.shade300)),
            onTap: () async {
              final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
              if (d != null) {
                setState(() => preferredDate = "\${d.day}/\${d.month}/\${d.year}");
              }
            },
          ),
          const SizedBox(height: 16),
          ListTile(
            title: Text(preferredTime.isEmpty ? tr('prefTimeLabel') : preferredTime),
            trailing: const Icon(Icons.access_time),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide(color: Colors.grey.shade300)),
            onTap: () async {
              final t = await showTimePicker(context: context, initialTime: TimeOfDay.now());
              if (t != null) {
                if(mounted) setState(() => preferredTime = t.format(context));
              }
            },
          )
        ],
      );
    }
    
    if (step == 13) {
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
      if (serviceTypes.contains('interior')) {
        price += 20000;
      }
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tr('reviewTitle'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(tr('reviewDesc'), style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 32),
          
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFFF3FBFA),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade300)
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(tr('tentativeQuote'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                      Text(tr('statusWait'), style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('৳ \${NumberFormat("#,##,###").format(price)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: Color(0xFF0F172A))),
                    Text(tr('startingPrice'), style: TextStyle(color: Colors.grey.shade500, fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                )
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(tr('serviceDetails'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(tr('serviceArea'), style: const TextStyle(fontWeight: FontWeight.bold)),
            trailing: Text(serviceTypes.join(', ').replaceAll('structural-architectural', 'Structural'), style: const TextStyle(fontSize: 15)),
          ),
          const Divider(),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(tr('prefDateLabel'), style: const TextStyle(fontWeight: FontWeight.bold)),
            trailing: Text("\$preferredDate | \$preferredTime", style: const TextStyle(fontSize: 15)),
          ),
          const SizedBox(height: 32),
        ],
      );
    }
    
    // Default Fallback
    return const Center(child: Text("Step Content Under Construction"));
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

  Widget _buildBottomAction() {
    final lang = context.locale.languageCode;
    String trKey(String key) => DesignTranslations.tr(key, lang);
    
    bool canNext = false;
    switch(step) {
      case 0: canNext = serviceTypes.isNotEmpty; break;
      case 1: canNext = designerOption.isNotEmpty; break;
      case 2: canNext = true; break; // Checkboxes
      case 3: canNext = landAreaKatha.isNotEmpty && initialFloors.isNotEmpty; break;
      case 4: canNext = true; break;
      case 5: canNext = structuralVibe.isNotEmpty; break;
      case 6: canNext = designerSelectionType.isNotEmpty; break;
      case 7: canNext = selectedDesignerId != null; break;
      case 8: canNext = propertyType.isNotEmpty; break;
      case 9:
        if (propertyType == 'Full building') canNext = houseType.isNotEmpty && intFloors.isNotEmpty && intUnitsPerFloor.isNotEmpty && intAreaPerUnit.isNotEmpty;
        else if (propertyType == 'Full Apartment') canNext = aptSize.isNotEmpty && aptRooms.isNotEmpty;
        else if (propertyType == 'Specific Area') canNext = specificAreaType.isNotEmpty && (specificAreaType != 'Bed Room' || bedRoomType.isNotEmpty) && designScope.isNotEmpty && roomSize.isNotEmpty;
        break;
      case 10: canNext = structuralVibe.isNotEmpty; break;
      case 11: canNext = designerSelectionType.isNotEmpty; break;
      case 12: canNext = preferredDate.isNotEmpty && preferredTime.isNotEmpty; break;
      case 13: canNext = true; break;
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
          onPressed: canNext ? (step == 13 ? handleSubmit : nextStep) : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0F172A), // Dark color for primary action matching web "Continue" Deep Black/Blue
            disabledBackgroundColor: Colors.grey.shade300,
            minimumSize: const Size(double.infinity, 54),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: loading 
            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : Text(
              step == 13 ? trKey('completeBooking') : trKey('continue_btn'),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
        ),
      ),
    );
  }
}
