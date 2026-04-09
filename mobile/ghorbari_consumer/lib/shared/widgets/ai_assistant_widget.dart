import 'package:flutter/material.dart';
// import 'package:speech_to_text/speech_to_text.dart' as stt;
// import 'package:flutter_tts/flutter_tts.dart';
import 'package:dio/dio.dart';
import 'dart:async';
// import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'dart:io';
import 'package:cached_network_image/cached_network_image.dart';

class AIAssistantWidget extends StatefulWidget {
  const AIAssistantWidget({super.key});

  @override
  State<AIAssistantWidget> createState() => _AIAssistantWidgetState();
}

class _AIAssistantWidgetState extends State<AIAssistantWidget> {
  bool _isOpen = false;
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, String>> _messages = [
    {'role': 'assistant', 'text': 'Hello! I am your Ghorbari AI assistant. How can I help you today?'}
  ];
  
  // final stt.SpeechToText _speech = stt.SpeechToText();
  // final FlutterTts _tts = FlutterTts();
  final Dio _dio = Dio();
  
  bool _isListening = false;
  bool _isTyping = false;
  String _currentLang = 'en';
  // File? _attachedImage;
  // final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _initTts();
  }

  void _initTts() async {
    // await _tts.setLanguage("en-US");
    // await _tts.setSpeechRate(0.5);
    // await _tts.setVolume(1.0);
    // await _tts.setPitch(1.0);
  }

  Future<void> _speak(String text, String lang) async {
    // if (lang == 'bn') {
    //   await _tts.setLanguage("bn-BD");
    // } else {
    //   await _tts.setLanguage("en-US");
    // }
    // await _tts.speak(text);
  }

  Future<void> _toggleListening() async {
    // if (!_isListening) {
    //   bool available = await _speech.initialize(
    //     onStatus: (status) => print('Speech status: $status'),
    //     onError: (error) => print('Speech error: $error'),
    //   );
    //   if (available) {
    //     setState(() => _isListening = true);
    //     _speech.listen(
    //       localeId: _currentLang == 'bn' ? 'bn_BD' : 'en_US',
    //       onResult: (result) {
    //         setState(() {
    //           _controller.text = result.recognizedWords;
    //           if (result.finalResult) {
    //             _isListening = false;
    //             _handleSend();
    //           }
    //         });
    //       },
    //     );
    //   }
    // } else {
    //   setState(() => _isListening = false);
    //   _speech.stop();
    // }
  }

  Future<void> _pickImage() async {
    // final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    // if (image != null) {
    //   setState(() {
    //     _attachedImage = File(image.path);
    //   });
    // }
  }

  Future<void> _handleSend() async {
    if (_controller.text.trim().isEmpty /* && _attachedImage == null */) return;

    final userText = _controller.text.trim();
    // final imageFile = _attachedImage;
    
    setState(() {
      _messages.add({
        'role': 'user', 
        'text': userText.isEmpty ? 'Attached image' : userText,
        // if (imageFile != null) 'imagePath': imageFile.path,
      });
      _controller.clear();
      // _attachedImage = null;
      _isTyping = true;
    });
    _scrollToBottom();

    try {
      // String? base64Image;
      // String? mimeType;
      // if (imageFile != null) {
      //   final bytes = await imageFile.readAsBytes();
      //   base64Image = base64Encode(bytes);
      //   mimeType = 'image/${imageFile.path.split('.').last}';
      // }

      // Format messages for the advanced API (AI SDK format)
      final apiMessages = _messages.map((m) {
        final Map<String, dynamic> msg = {
          'role': m['role'],
          'content': m['text'],
        };
        
        if (m.containsKey('imagePath') && m['role'] == 'user') {
          // This is a simplification; the real API expect attachments in the last message
          // but for now we'll just send the current interaction data.
        }
        return msg;
      }).toList();

      final response = await _dio.post(
        'https://ghorbari.tech/api/chat',
        data: {
          'userId': 'mobile_user', // TODO: Get real user ID
          'messages': apiMessages,
          'language': _currentLang,
          'stream': false, // Request JSON for mobile
          // if (base64Image != null)
          //   'experimental_attachments': [
          //     {
          //       'name': 'image.png',
          //       'contentType': mimeType,
          //       'url': 'data:$mimeType;base64,$base64Image',
          //     }
          //   ],
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final botReply = data['text'] ?? "I've processed your request.";
        final toolResults = data['toolResults'] as List?;
        
        String? generatedImageUrl;
        if (toolResults != null) {
          for (var res in toolResults) {
            if (res['toolName'] == 'generate_design_image' && 
                res['result'] != null && 
                res['result']['success'] == true) {
              generatedImageUrl = res['result']['url'];
            }
          }
        }
        
        setState(() {
          _messages.add({
            'role': 'assistant', 
            'text': botReply,
            if (generatedImageUrl != null) 'imageUrl': generatedImageUrl,
          });
          _isTyping = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      print('AI Chat Error: $e');
      setState(() {
        _messages.add({'role': 'assistant', 'text': 'Sorry, I am having trouble connecting.'});
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
      bottom: 80, // Above bottom nav
      right: 16,
      child: GestureDetector(
        onTap: () => setState(() => _isOpen = !_isOpen),
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              colors: [Color(0xFF2563EB), Color(0xFF3B82F6)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.blue.withOpacity(0.3),
                blurRadius: 10,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: Icon(
            _isOpen ? Icons.close : Icons.smart_toy_rounded,
            color: Colors.white,
            size: 28,
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
        height: 400,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, 10),
            )
          ],
        ),
        child: Column(
          children: [
            _buildHeader(),
            Expanded(child: _buildMessageList()),
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
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_awesome, color: Colors.blue, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Ghorbari AI',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          DropdownButton<String>(
            value: _currentLang,
            dropdownColor: const Color(0xFF1E293B),
            underline: const SizedBox(),
            icon: const Icon(Icons.language, color: Colors.white70, size: 16),
            items: const [
              DropdownMenuItem(value: 'en', child: Text('EN', style: TextStyle(color: Colors.white, fontSize: 12))),
              DropdownMenuItem(value: 'bn', child: Text('BN', style: TextStyle(color: Colors.white, fontSize: 12))),
            ],
            onChanged: (val) => setState(() => _currentLang = val!),
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
        return Align(
          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: isUser ? const Color(0xFF2563EB) : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(15).copyWith(
                bottomRight: isUser ? Radius.zero : null,
                bottomLeft: !isUser ? Radius.zero : null,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (msg.containsKey('imagePath') || msg.containsKey('imageUrl'))
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: msg.containsKey('imagePath') 
                        ? Image.file(
                            File(msg['imagePath']!),
                            height: 150,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          )
                        : CachedNetworkImage(
                            imageUrl: msg['imageUrl']!,
                            height: 150,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              height: 150,
                              color: Colors.grey.shade200,
                              child: const Center(child: CircularProgressIndicator()),
                            ),
                          ),
                    ),
                  ),
                Text(
                  msg['text']!,
                  style: TextStyle(
                    color: isUser ? Colors.white : Colors.black87,
                    fontSize: 13,
                  ),
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
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(15),
        ),
        child: const SizedBox(
          width: 20,
          height: 10,
          child: LinearProgressIndicator(minHeight: 2),
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: Colors.grey.shade100)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(25),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // if (_attachedImage != null)
                  //   Padding(
                  //     padding: const EdgeInsets.only(top: 8, left: 8, right: 8),
                  //     child: Stack(
                  //       children: [
                  //         ClipRRect(
                  //           borderRadius: BorderRadius.circular(10),
                  //           child: Image.file(
                  //             _attachedImage!,
                  //             height: 60,
                  //             width: 60,
                  //             fit: BoxFit.cover,
                  //           ),
                  //         ),
                  //         Positioned(
                  //           top: -5,
                  //           right: -5,
                  //           child: GestureDetector(
                  //             onTap: () => setState(() => _attachedImage = null),
                  //             child: Container(
                  //               padding: const EdgeInsets.all(2),
                  //               decoration: const BoxDecoration(
                  //                 color: Colors.black54,
                  //                 shape: BoxShape.circle,
                  //               ),
                  //               child: const Icon(Icons.close, size: 14, color: Colors.white),
                  //             ),
                  //           ),
                  //         ),
                  //       ],
                  //     ),
                  //   ),
                  TextField(
                    controller: _controller,
                    onSubmitted: (_) => _handleSend(),
                    decoration: const InputDecoration(
                      hintText: 'Ask me something...',
                      border: InputBorder.none,
                      hintStyle: TextStyle(fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.image_outlined, color: Colors.grey),
            onPressed: () {},
          ),
          IconButton(
            icon: Icon(_isListening ? Icons.mic : Icons.mic_none, color: _isListening ? Colors.red : Colors.grey),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.send, color: Color(0xFF0F172A)),
            onPressed: _handleSend,
          ),
        ],
      ),
    );
  }
}
