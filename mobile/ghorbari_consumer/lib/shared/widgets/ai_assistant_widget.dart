import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import 'package:dio/dio.dart';
import 'dart:async';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'dart:io';
import 'package:cached_network_image/cached_network_image.dart';

/**
 * 🤖 Dalankotha AI Mobile Assistant
 * Stable Version: 2.0.0 (Agent Unified)
 * Features: Multi-turn chat, Grounded advice, Design visualization, Voice (STT/TTS).
 */

class AIAssistantWidget extends StatefulWidget {
  const AIAssistantWidget({super.key});

  @override
  State<AIAssistantWidget> createState() => _AIAssistantWidgetState();
}

class _AIAssistantWidgetState extends State<AIAssistantWidget> {
  bool _isOpen = false;
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  // Normalized message structure: {role, content, imageUrl}
  final List<Map<String, String>> _messages = [
    {'role': 'assistant', 'content': 'Assalamu Alaikum! I am Dalankotha AI. How can I help you with your construction or design today?'}
  ];
  
  final stt.SpeechToText _speech = stt.SpeechToText();
  final FlutterTts _tts = FlutterTts();
  final Dio _dio = Dio();
  final ImagePicker _picker = ImagePicker();
  
  bool _isListening = false;
  bool _isTyping = false;
  String _currentLang = 'bn'; // Default to Bengali as per skill.md
  File? _attachedImage;

  @override
  void initState() {
    super.initState();
    _initServices();
  }

  Future<void> _initServices() async {
    await _tts.setLanguage("bn-BD");
    await _tts.setSpeechRate(0.5);
  }

  Future<void> _speak(String text) async {
    if (_currentLang == 'bn') {
      await _tts.setLanguage("bn-BD");
    } else {
      await _tts.setLanguage("en-US");
    }
    await _tts.speak(text);
  }

  Future<void> _toggleListening() async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (status) => print('Speech status: $status'),
        onError: (error) => print('Speech error: $error'),
      );
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          localeId: _currentLang == 'bn' ? 'bn-BD' : 'en-US',
          onResult: (result) {
            setState(() {
              _controller.text = result.recognizedWords;
              if (result.finalResult) {
                _isListening = false;
                _handleSend();
              }
            });
          },
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
    }
  }

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 70);
    if (image != null) {
      setState(() {
        _attachedImage = File(image.path);
      });
    }
  }

  Future<void> _handleSend() async {
    final userText = _controller.text.trim();
    if (userText.isEmpty && _attachedImage == null) return;

    final imageFile = _attachedImage;
    
    setState(() {
      _messages.add({
        'role': 'user', 
        'content': userText.isEmpty ? 'Checked design reference' : userText,
        if (imageFile != null) 'localPath': imageFile.path,
      });
      _controller.clear();
      _attachedImage = null;
      _isTyping = true;
    });
    _scrollToBottom();

    try {
      String? base64Image;
      String? mimeType;
      if (imageFile != null) {
        final bytes = await imageFile.readAsBytes();
        base64Image = base64Encode(bytes);
        mimeType = 'image/${imageFile.path.split('.').last}';
      }

      // 1. Prepare messages for unified API
      final apiMessages = _messages.map((m) {
        return {
          'role': m['role'],
          'content': m['content'],
        };
      }).toList();

      // 2. Call unified endpoint
      final response = await _dio.post(
        'https://Dalankotha.tech/api/chat',
        data: {
          'userId': 'mobile_user_demo', // TODO: Use real user UUID
          'messages': apiMessages,
          'lang': _currentLang,
          'stream': false,
          if (base64Image != null)
            'experimental_attachments': [
              {
                'name': 'reference.png',
                'contentType': mimeType,
                'url': 'data:$mimeType;base64,$base64Image',
              }
            ],
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final botReply = data['text'] ?? "";
        final toolResults = data['toolResults'] as List?;
        
        String? generatedImageUrl;
        if (toolResults != null) {
          for (var res in toolResults) {
            if ((res['toolName'] == 'generate_visual_design' || res['toolName'] == 'generate_design_image') && 
                res['result'] != null && 
                res['result']['success'] == true) {
              generatedImageUrl = res['result']['url'];
            }
          }
        }
        
        setState(() {
          _messages.add({
            'role': 'assistant', 
            'content': botReply,
            if (generatedImageUrl != null) 'imageUrl': generatedImageUrl,
          });
          _isTyping = false;
        });
        
        _scrollToBottom();
        
        // Auto-speak if it's a short reply
        if (botReply.length < 150) {
          _speak(botReply);
        }
      }
    } catch (e) {
      print('[AI Assistant] Error: $e');
      setState(() {
        _messages.add({'role': 'assistant', 'content': 'দুঃখিত, সংযোগে সমস্যা হচ্ছে। (Connection Error)'});
        _isTyping = false;
      });
    }
  }

  void _scrollToBottom() {
    Timer(const Duration(milliseconds: 300), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (_isOpen) _buildChatWindow(),
        _buildFab(),
      ],
    );
  }

  Widget _buildFab() {
    return Positioned(
      bottom: 80,
      right: 16,
      child: GestureDetector(
        onTap: () => setState(() => _isOpen = !_isOpen),
        child: Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFF0F172A),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4))
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(_isOpen ? Icons.close : Icons.auto_awesome, color: Colors.blue, size: 24),
              if (!_isOpen) const Text('AI', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChatWindow() {
    return Positioned(
      bottom: 150,
      right: 16,
      left: 16,
      child: Container(
        height: 450,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 30)],
        ),
        child: Column(
          children: [
            _buildHeader(),
            Expanded(child: _buildMessageList()),
            if (_attachedImage != null) _buildImagePreview(),
            _buildInputArea(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text('Dalankotha AI Assistant', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
          Row(
            children: [
              TextButton(
                onPressed: () => setState(() => _currentLang = _currentLang == 'bn' ? 'en' : 'bn'),
                child: Text(_currentLang.toUpperCase(), style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
              ),
              IconButton(onPressed: () => setState(() => _isOpen = false), icon: const Icon(Icons.close, color: Colors.white70, size: 20)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMessageList() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: _messages.length + (_isTyping ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == _messages.length) return _buildTypingIndicator();
        final msg = _messages[index];
        final isUser = msg['role'] == 'user';
        final hasImage = msg.containsKey('imageUrl') || msg.containsKey('localPath');

        return Align(
          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(12),
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
            decoration: BoxDecoration(
              color: isUser ? const Color(0xFF2563EB) : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(16).copyWith(
                bottomRight: isUser ? Radius.zero : null,
                bottomLeft: !isUser ? Radius.zero : null,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (hasImage) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: msg.containsKey('localPath')
                        ? Image.file(File(msg['localPath']!), height: 150, width: double.infinity, fit: BoxFit.cover)
                        : CachedNetworkImage(imageUrl: msg['imageUrl']!, height: 150, width: double.infinity, fit: BoxFit.cover),
                  ),
                  const SizedBox(height: 8),
                ],
                Text(
                  msg['content']!,
                  style: TextStyle(color: isUser ? Colors.white : Colors.black87, fontSize: 13),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(16)),
        child: const SizedBox(width: 24, child: LinearProgressIndicator(minHeight: 2, backgroundColor: Colors.transparent)),
      ),
    );
  }

  Widget _buildImagePreview() {
    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Stack(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.file(_attachedImage!, width: 60, height: 60, fit: BoxFit.cover),
          ),
          Positioned(
            right: 0,
            child: GestureDetector(
              onTap: () => setState(() => _attachedImage = null),
              child: const CircleAvatar(radius: 10, backgroundColor: Colors.red, child: Icon(Icons.close, size: 12, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputArea() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          IconButton(onPressed: _pickImage, icon: const Icon(Icons.image_search, color: Colors.grey)),
          Expanded(
            child: TextField(
              controller: _controller,
              onSubmitted: (_) => _handleSend(),
              decoration: InputDecoration(
                hintText: _currentLang == 'bn' ? 'বার্তা লিখুন...' : 'Message...',
                filled: true,
                fillColor: Colors.grey.shade50,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              ),
            ),
          ),
          IconButton(
            onPressed: _toggleListening,
            icon: Icon(_isListening ? Icons.mic : Icons.mic_none, color: _isListening ? Colors.red : Colors.grey),
          ),
          IconButton(
            onPressed: _handleSend,
            icon: const Icon(Icons.send_rounded, color: Color(0xFF2563EB)),
          ),
        ],
      ),
    );
  }
}
