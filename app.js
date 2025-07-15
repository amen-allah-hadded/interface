
    const SERVER_URL = 'https://audio-watermarker-production-328c.up.railway.app/';

    // Configuration Storj
    let storjConfig = {
      accessKey: 'jw7whq6kufg7i6ohuvtogtlytbta',
      secretKey: 'j3fmiuqic5n37p7iip6aexw3kfpblfflo7e53jzoi7tzjbslza2xc',
      endpoint: 'https://gateway.storjshare.io',
      bucketName: 'watermark'
    };

    // Variables globales
    let downloadData = null;
    let downloadFilename = null;
    let selectedAudioFile = null;
    let selectedMediaFile = null;
    let textContent = '';
    let selectedContentType = 'text';

    // Initialisation
    document.addEventListener('DOMContentLoaded', function() {
      // Créer l'animation de particules en arrière-plan
      createBackgroundParticles();

      // Charger les ondelettes disponibles
      loadWavelets();

      // Configuration des listeners et dropzones
      setupEventListeners();
      
      // Animation initiale
      animateElements();
    });

    // Création des particules en arrière-plan
    function createBackgroundParticles() {
      const container = document.getElementById('bg-animation');
      const colors = ['rgba(255, 0, 146, 0.2)', 'rgba(0, 209, 255, 0.15)', 'rgba(98, 54, 255, 0.15)'];
      
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'bg-particle';
        
        // Positionnement aléatoire
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const size = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 10;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.left = `${posX}%`;
        particle.style.bottom = `-${size}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = (Math.random() * 0.2) + 0.1;
        particle.style.background = color;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        container.appendChild(particle);
      }
    }

    // Animations des éléments au chargement
    function animateElements() {
      const elements = document.querySelectorAll('.header, .tabs, .glassy-card');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('bounce-in');
        }, index * 150);
      });
    }

    // Configuration des écouteurs d'événements
    function setupEventListeners() {
      // Configuration des dropzones pour les fichiers
      setupFileDropArea('audio-drop-area', 'audio-file', 'audio-file-info', (file) => {
        selectedAudioFile = file;
      });

      setupFileDropArea('extract-audio-drop-area', 'extract-audio-file', 'extract-file-info');

      setupFileDropArea('media-drop-area', 'media-file', 'media-file-info', (file) => {
        selectedMediaFile = file;
        if (file) {
          previewFile(file);
        }
      });

      // Écouter les changements dans le champ de texte
      document.getElementById('text-content').addEventListener('input', function(e) {
        textContent = e.target.value;
        if (textContent) {
          previewText(textContent);
        }
      });

      // Configuration des toggles pour options avancées
      document.getElementById('embed-advanced-toggle').addEventListener('click', function() {
        toggleAdvancedOptions('embed');
      });

      document.getElementById('extract-advanced-toggle').addEventListener('click', function() {
        toggleAdvancedOptions('extract');
      });
    }

    // Gestion des onglets
    function switchTab(tabName) {
      // Mise à jour de l'indicateur visuel
      document.getElementById('app-tabs').setAttribute('data-active-tab', tabName);
      
      // Mise à jour des classes actives pour les boutons
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
      
      // Affichage du contenu correspondant
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    // Configuration des zones de dépôt de fichiers
    function setupFileDropArea(areaId, inputId, infoId, callback) {
      const dropArea = document.getElementById(areaId);
      const fileInput = document.getElementById(inputId);
      const fileInfo = document.getElementById(infoId);

      // Clic pour sélectionner
      dropArea.addEventListener('click', () => {
        fileInput.click();
      });

      // Changement de fichier
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          const file = fileInput.files[0];
          displayFileInfo(file, fileInfo);
          if (callback) callback(file);
        }
      });

      // Drag and drop
      dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
      });

      dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
      });

      dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          fileInput.files = e.dataTransfer.files;
          displayFileInfo(file, fileInfo);
          if (callback) callback(file);
        }
      });
    }

    // Affichage des infos du fichier
    function displayFileInfo(file, infoElement) {
      const size = formatFileSize(file.size);
      
      let fileIcon = 'fa-file';
      if (file.type.startsWith('image/')) fileIcon = 'fa-file-image';
      else if (file.type.startsWith('audio/')) fileIcon = 'fa-file-audio';
      else if (file.type.startsWith('video/')) fileIcon = 'fa-file-video';
      else if (file.type.startsWith('text/')) fileIcon = 'fa-file-alt';
      
      infoElement.innerHTML = `
        <div class="file-info bounce-in">
          <i class="fas ${fileIcon}"></i>
          <div class="file-details">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${size}</div>
          </div>
        </div>
      `;
      
      infoElement.classList.remove('hidden');
    }

    // Sélection du type de contenu
    function selectContentType(type) {
      // Mettre à jour l'état de sélection visuelle
      document.querySelectorAll('.type-option').forEach(option => {
        option.classList.remove('selected');
      });
      document.querySelector(`.type-option[data-type="${type}"]`).classList.add('selected');
      
      selectedContentType = type;
      
      // Afficher le champ approprié
      const textInput = document.getElementById('text-input');
      const fileInput = document.getElementById('file-input');
      const fileTypeHint = document.getElementById('file-type-hint');
      const mediaFileInput = document.getElementById('media-file');
      
      if (type === 'text') {
        textInput.classList.remove('hidden');
        fileInput.classList.add('hidden');
        selectedMediaFile = null;
        mediaFileInput.value = '';
      } else {
        textInput.classList.add('hidden');
        fileInput.classList.remove('hidden');
        textContent = '';
        document.getElementById('text-content').value = '';
        
        // Mise à jour des types de fichiers acceptés
        switch (type) {
          case 'image':
            mediaFileInput.accept = '.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg';
            fileTypeHint.textContent = 'Images: JPG, PNG, GIF, WEBP, SVG';
            break;
          case 'audio':
            mediaFileInput.accept = '.mp3,.wav,.flac,.aac,.ogg,.m4a';
            fileTypeHint.textContent = 'Audio: MP3, WAV, FLAC, AAC, OGG';
            break;
          case 'video':
            mediaFileInput.accept = '.mp4,.avi,.mov,.mkv,.wmv,.webm';
            fileTypeHint.textContent = 'Vidéo: MP4, AVI, MOV, MKV, WEBM';
            break;
        }
      }
      
      document.getElementById('content-preview').classList.add('hidden');
    }

    // Affichage des options avancées
    function toggleAdvancedOptions(type) {
      const content = document.getElementById(`${type}-advanced`);
      const toggle = document.getElementById(`${type}-advanced-toggle`);
      
      content.classList.toggle('expanded');
      toggle.classList.toggle('expanded');
    }

    // Prévisualisation des fichiers
    function previewFile(file) {
      const preview = document.getElementById('content-preview');
      const contentType = selectedContentType;
      
      preview.innerHTML = '';
      preview.classList.remove('hidden');
      
      // En-tête de prévisualisation
      const previewHeader = document.createElement('div');
      previewHeader.className = 'mb-4';
      previewHeader.innerHTML = `<div class="font-semibold text-lg mb-2">Prévisualisation:</div>`;
      preview.appendChild(previewHeader);
      
      if (contentType === 'image' && file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        preview.appendChild(img);
      } else if (contentType === 'video' && file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.onload = () => URL.revokeObjectURL(video.src);
        preview.appendChild(video);
      } else if (contentType === 'audio' && file.type.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(file);
        audio.controls = true;
        audio.onload = () => URL.revokeObjectURL(audio.src);
        preview.appendChild(audio);
      }
      
      // Afficher l'info fichier en bas
      const fileInfo = document.createElement('div');
      fileInfo.className = 'file-info mt-4';
      fileInfo.innerHTML = `
        <i class="fas fa-file-alt"></i>
        <div class="file-details">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
      `;
      preview.appendChild(fileInfo);
      
      // Animation d'entrée
      preview.classList.add('bounce-in');
    }

    // Prévisualisation du texte
    function previewText(text) {
      const preview = document.getElementById('content-preview');
      
      preview.innerHTML = `
        <div class="mb-4"><div class="font-semibold text-lg">Prévisualisation:</div></div>
        <div class="bg-white p-4 rounded-lg text-sm" style="max-height: 200px; overflow-y: auto; white-space: pre-wrap;">
          ${text}
        </div>
        <div class="file-info mt-4">
          <i class="fas fa-file-alt"></i>
          <div class="file-details">
            <div class="file-name">Texte</div>
            <div class="file-size">${text.length} caractères</div>
          </div>
        </div>
      `;
      
      preview.classList.remove('hidden');
      preview.classList.add('bounce-in');
    }

    // Chargement des ondelettes disponibles
    async function loadWavelets() {
      try {
        const response = await fetch(`${SERVER_URL}/api/wavelets`);
        const data = await response.json();
        
        const selects = document.querySelectorAll('[id$="dwt-wavelet"]');
        selects.forEach(select => {
          select.innerHTML = '';
          data.wavelets.forEach(wavelet => {
            const option = document.createElement('option');
            option.value = wavelet;
            option.textContent = wavelet;
            if (wavelet === 'haar') option.selected = true;
            select.appendChild(option);
          });
        });
      } catch (error) {
        console.error('Erreur lors du chargement des ondelettes:', error);
      }
    }

    // Génération d'un ID unique stylisé
    function generateSmartID(contentType) {
      const typePrefix = {
        'text': 'TX',
        'image': 'IM',
        'audio': 'AU',
        'video': 'VI'
      };
      
      const timestamp = Date.now().toString(36).slice(-4);
      const random = Math.random().toString(36).slice(-4);
      const prefix = typePrefix[contentType] || 'XX';
      const sequence = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      
      return `${prefix}${timestamp}${random}${sequence}`.toUpperCase();
    }

    // Validation de la configuration
    function validateConfig() {
      if (!storjConfig.accessKey || !storjConfig.secretKey || !storjConfig.bucketName) {
        showStatus('Erreur de configuration de stockage. Contactez l\'administrateur.', 'error', 'embed-status');
        return false;
      }
      return true;
    }

    // Processus d'insertion de watermark
    async function processEmbedding() {
      // Validation
      if (!selectedAudioFile) {
        showStatus('Tu dois sélectionner un fichier audio à watermarker!', 'error', 'embed-status');
        return;
      }
      
      let contentData = null;
      
      if (selectedContentType === 'text') {
        if (!textContent.trim()) {
          showStatus('Entre du texte à cacher dans l\'audio!', 'error', 'embed-status');
          return;
        }
        contentData = textContent;
      } else {
        if (!selectedMediaFile) {
          showStatus('Tu dois sélectionner un fichier à cacher!', 'error', 'embed-status');
          return;
        }
        contentData = selectedMediaFile;
      }
      
      if (!validateConfig()) return;
      
      // Préparation de l'interface
      const button = document.getElementById('embed-btn');
      const progress = document.getElementById('embed-progress');
      const result = document.getElementById('embed-result');
      
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin btn-icon"></i>Traitement en cours...';
      progress.style.display = 'block';
      result.style.display = 'none';
      
      try {
        // Étape 1: Générer un ID unique
        const uniqueID = generateSmartID(selectedContentType);
        document.getElementById('generated-id').textContent = uniqueID;
        
        updateProgress('embed-progress-fill', 'embed-progress-percent', 20);
        document.getElementById('embed-progress-text').textContent = '🔑 Génération de l\'identifiant unique...';
        
        // Simulation d'attente pour montrer l'animation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Étape 2: Uploader le contenu sur Storj
        document.getElementById('embed-progress-text').textContent = '☁️ Transfert du contenu vers le stockage sécurisé...';
        updateProgress('embed-progress-fill', 'embed-progress-percent', 50);
        
        await uploadContentToStorj(uniqueID, selectedContentType, contentData);
        
        // Simulation d'attente pour montrer l'animation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Étape 3: Insérer l'ID dans l'audio via watermarking
        document.getElementById('embed-progress-text').textContent = '🔐 Application du watermark dans l\'audio...';
        await embedWatermarkInAudio(uniqueID, selectedAudioFile);
        
        updateProgress('embed-progress-fill', 'embed-progress-percent', 100);
        
        // Affichage du résultat
        await new Promise(resolve => setTimeout(resolve, 500));
        progress.style.display = 'none';
        result.style.display = 'block';
        
      } catch (error) {
        progress.style.display = 'none';
        showStatus(`Erreur: ${error.message}`, 'error', 'embed-status');
      } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-shield-alt btn-icon"></i>Protéger Maintenant';
      }
    }

    // Upload vers Storj
    async function uploadContentToStorj(id, contentType, content) {
      let filename, fileData;
      
      if (contentType === 'text') {
        filename = `${id}.txt`;
        fileData = new Blob([content], { type: 'text/plain' });
      } else {
        const extension = content.name.split('.').pop();
        filename = `${id}.${extension}`;
        fileData = content;
      }
      
      const url = `${storjConfig.endpoint}/${storjConfig.bucketName}/${encodeURIComponent(filename)}`;
      const basicAuth = btoa(`${storjConfig.accessKey}:${storjConfig.secretKey}`);
      
      let response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': fileData.type || 'application/octet-stream'
        },
        body: fileData
      });
      
      if (!response.ok && response.status === 403) {
        const urlObj = new URL(url);
        const hostHeader = urlObj.hostname;
        const headers = {
          'Content-Type': fileData.type || 'application/octet-stream',
          'Host': hostHeader
        };
        
        const signedHeaders = await createAWS4Signature('PUT', url, headers, fileData);
        
        response = await fetch(url, {
          method: 'PUT',
          headers: signedHeaders,
          body: fileData
        });
      }
      
      if (!response.ok) {
        throw new Error(`Échec de l'upload: ${response.status} - ${response.statusText}`);
      }
    }

    // Insertion du watermark dans l'audio
    async function embedWatermarkInAudio(watermarkText, audioFile) {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('watermark_text', watermarkText);
      formData.append('method', document.getElementById('embed-method').value);
      formData.append('segment_length', document.getElementById('embed-segment-length').value);
      formData.append('seed', document.getElementById('embed-seed').value);
      formData.append('modulation_strength', document.getElementById('embed-modulation').value);
      formData.append('band_lower_pct', document.getElementById('embed-band-lower').value);
      formData.append('band_upper_pct', document.getElementById('embed-band-upper').value);
      formData.append('n_coeffs', document.getElementById('embed-n-coeffs').value);
      formData.append('dwt_level', document.getElementById('embed-dwt-level').value);
      formData.append('dwt_wavelet', document.getElementById('embed-dwt-wavelet').value);
      formData.append('dwt_coeff_type', document.getElementById('embed-dwt-coeff').value);
      
      const response = await fetch(`${SERVER_URL}/api/embed`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'insertion du watermark');
      }
      
      downloadData = data.file_data;
      downloadFilename = data.filename;
    }

    // Processus d'extraction
    async function processExtraction() {
      const audioFile = document.getElementById('extract-audio-file').files[0];
      
      if (!audioFile) {
        showStatus('Tu dois sélectionner un fichier audio à analyser!', 'error', 'extract-status');
        return;
      }
      
      if (!validateConfig()) return;
      
      // Préparation de l'interface
      const button = document.getElementById('extract-btn');
      const progress = document.getElementById('extract-progress');
      const result = document.getElementById('extract-result');
      
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin btn-icon"></i>Extraction en cours...';
      progress.style.display = 'block';
      result.style.display = 'none';
      
      try {
        // Étape 1: Extraire l'ID du watermark
        document.getElementById('extract-progress-text').textContent = '🔍 Analyse du fichier audio...';
        updateProgress('extract-progress-fill', 'extract-progress-percent', 30);
        
        const extractedID = await extractWatermarkFromAudio(audioFile);
        document.getElementById('extracted-id').textContent = extractedID;
        
        // Simulation d'attente pour montrer l'animation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Étape 2: Récupérer le contenu depuis Storj
        document.getElementById('extract-progress-text').textContent = '🔄 Récupération du contenu caché...';
        updateProgress('extract-progress-fill', 'extract-progress-percent', 70);
        
        await retrieveContentFromStorj(extractedID);
        
        updateProgress('extract-progress-fill', 'extract-progress-percent', 100);
        
        // Affichage du résultat
        await new Promise(resolve => setTimeout(resolve, 500));
        progress.style.display = 'none';
        result.style.display = 'block';
        
      } catch (error) {
        progress.style.display = 'none';
        showStatus(`Erreur: ${error.message}`, 'error', 'extract-status');
      } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-magic btn-icon"></i>Extraire le Contenu';
      }
    }

    // Extraction du watermark depuis l'audio
    async function extractWatermarkFromAudio(audioFile) {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('watermark_length', '12');
      formData.append('method', document.getElementById('extract-method').value);
      formData.append('segment_length', document.getElementById('extract-segment-length').value);
      formData.append('seed', document.getElementById('extract-seed').value);
      formData.append('modulation_strength', document.getElementById('extract-modulation').value);
      formData.append('band_lower_pct', document.getElementById('extract-band-lower').value);
      formData.append('band_upper_pct', document.getElementById('extract-band-upper').value);
      formData.append('n_coeffs', document.getElementById('extract-n-coeffs').value);
      formData.append('dwt_level', document.getElementById('extract-dwt-level').value);
      formData.append('dwt_wavelet', document.getElementById('extract-dwt-wavelet').value);
      formData.append('dwt_coeff_type', document.getElementById('extract-dwt-coeff').value);
      
      const response = await fetch(`${SERVER_URL}/api/extract`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'extraction du watermark');
      }
      
      return data.extracted_watermark.trim();
    }

    // Récupération du contenu depuis Storj
    async function retrieveContentFromStorj(id) {
      // Déterminer le type de contenu à partir de l'ID
      const contentType = getContentTypeFromID(id);
      
      const possibleExtensions = {
        'text': ['txt'],
        'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
        'audio': ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
        'video': ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'webm']
      };
      
      let foundFile = null;
      let foundExtension = null;
      
      // Essayer de trouver le fichier avec les extensions possibles
      for (const ext of possibleExtensions[contentType] || ['txt']) {
        try {
          const filename = `${id}.${ext}`;
          const url = `${storjConfig.endpoint}/${storjConfig.bucketName}/${encodeURIComponent(filename)}`;
          const basicAuth = btoa(`${storjConfig.accessKey}:${storjConfig.secretKey}`);
          
          let response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${basicAuth}`
            }
          });
          
          if (!response.ok && response.status === 403) {
            const urlObj = new URL(url);
            const hostHeader = urlObj.host;
            const headers = { 'Host': hostHeader };
            
            const signedHeaders = await createAWS4Signature('GET', url, headers);
            
            response = await fetch(url, {
              method: 'GET',
              headers: signedHeaders
            });
          }
          
          if (response.ok) {
            foundFile = await response.blob();
            foundExtension = ext;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!foundFile) {
        throw new Error('Fichier non trouvé dans le stockage');
      }
      
      // Afficher le contenu récupéré
      await displayRetrievedContent(id, contentType, foundFile, foundExtension);
    }

    // Affichage du contenu récupéré
    async function displayRetrievedContent(id, contentType, file, extension) {
      const container = document.getElementById('extracted-content');
      container.innerHTML = '';
      
      const header = document.createElement('div');
      header.className = 'mb-4';
      header.innerHTML = `<div class="font-semibold text-lg">Contenu Récupéré:</div>`;
      container.appendChild(header);
      
      if (contentType === 'text') {
        const text = await file.text();
        const textDiv = document.createElement('div');
        textDiv.className = 'bg-white p-4 rounded-lg text-sm';
        textDiv.style.maxHeight = '200px';
        textDiv.style.overflowY = 'auto';
        textDiv.style.whiteSpace = 'pre-wrap';
        textDiv.textContent = text;
        container.appendChild(textDiv);
      } else if (contentType === 'image') {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        container.appendChild(img);
      } else if (contentType === 'video') {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.onload = () => URL.revokeObjectURL(video.src);
        container.appendChild(video);
      } else if (contentType === 'audio') {
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(file);
        audio.controls = true;
        audio.onload = () => URL.revokeObjectURL(audio.src);
        container.appendChild(audio);
      }
      
      // Infos fichier
      const fileInfo = document.createElement('div');
      fileInfo.className = 'file-info mt-4';
      fileInfo.innerHTML = `
        <i class="fas fa-file-alt"></i>
        <div class="file-details">
          <div class="file-name">${id}.${extension}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
      `;
      container.appendChild(fileInfo);
      
      // Bouton de téléchargement
      const downloadBtnContainer = document.createElement('div');
      downloadBtnContainer.className = 'text-center mt-4';
      
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'btn btn-success';
      downloadBtn.innerHTML = '<i class="fas fa-download btn-icon"></i>Télécharger le contenu';
      downloadBtn.onclick = () => {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${id}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
      };
      
      downloadBtnContainer.appendChild(downloadBtn);
      container.appendChild(downloadBtnContainer);
    }

    // Utilitaires pour la mise à jour de la progression
    function updateProgress(fillId, percentId, percent) {
      document.getElementById(fillId).style.width = percent + '%';
      if (percentId) {
        document.getElementById(percentId).textContent = percent + '%';
      }
    }

    // Affichage des messages de statut
    function showStatus(message, type, elementId) {
      const statusDiv = document.getElementById(elementId);
      
      let icon, title;
      switch(type) {
        case 'success':
          icon = 'fa-check-circle';
          title = 'Succès!';
          break;
        case 'error':
          icon = 'fa-exclamation-circle';
          title = 'Erreur!';
          break;
        case 'warning':
          icon = 'fa-exclamation-triangle';
          title = 'Attention!';
          break;
        case 'info':
        default:
          icon = 'fa-info-circle';
          title = 'Information';
      }
      
      statusDiv.innerHTML = `
        <div class="alert alert-${type} bounce-in">
          <div class="alert-icon"><i class="fas ${icon}"></i></div>
          <div class="alert-content">
            <div class="alert-title">${title}</div>
            <p class="alert-message">${message}</p>
          </div>
        </div>
      `;
    }

    // Téléchargement de l'audio watermarké
    function downloadWatermarkedAudio() {
      if (!downloadData || !downloadFilename) {
        showStatus('Aucun fichier disponible pour téléchargement', 'error', 'embed-status');
        return;
      }
      
      const byteCharacters = atob(downloadData);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray]);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }

    // Fonctions utilitaires
    function getContentTypeFromID(id) {
      const prefix = id.substring(0, 2);
      const typeMap = {
        'TX': 'text',
        'IM': 'image',
        'AU': 'audio',
        'VI': 'video'
      };
      return typeMap[prefix] || 'text';
    }

    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Fonctions cryptographiques pour AWS4
    async function createAWS4Signature(method, url, headers, payload) {
      const AWS_ALGORITHM = 'AWS4-HMAC-SHA256';
      const AWS_SERVICE = 's3';
      const AWS_REGION = 'us-east-1';
      
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
      const dateStamp = amzDate.substr(0, 8);
      
      let payloadHash;
      if (payload instanceof Blob || payload instanceof ArrayBuffer) {
        payloadHash = await sha256ArrayBuffer(await payload.arrayBuffer ? await payload.arrayBuffer() : payload);
      } else if (typeof payload === 'string') {
        payloadHash = await sha256(payload);
      } else if (!payload) {
        payloadHash = await sha256('');
      } else {
        payloadHash = await sha256('');
      }
      
      headers['x-amz-content-sha256'] = payloadHash;
      headers['x-amz-date'] = amzDate;
      
      const canonicalHeaders = Object.keys(headers)
        .sort()
        .map(key => `${key.toLowerCase()}:${headers[key]}`)
        .join('\n') + '\n';
      
      const signedHeaders = Object.keys(headers)
        .sort()
        .map(key => key.toLowerCase())
        .join(';');
      
      const canonicalRequest = [
        method,
        new URL(url).pathname,
        new URL(url).search.slice(1),
        canonicalHeaders,
        signedHeaders,
        payloadHash
      ].join('\n');
      
      const credentialScope = `${dateStamp}/${AWS_REGION}/${AWS_SERVICE}/aws4_request`;
      
      const stringToSign = [
        AWS_ALGORITHM,
        amzDate,
        credentialScope,
        await sha256(canonicalRequest)
      ].join('\n');
      
      const signingKey = await getSignatureKey(storjConfig.secretKey, dateStamp, AWS_REGION, AWS_SERVICE);
      const signature = await hmacSha256(stringToSign, signingKey);
      
      const authHeader = `${AWS_ALGORITHM} Credential=${storjConfig.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
      
      return {
        'Authorization': authHeader,
        ...headers
      };
    }

    async function sha256ArrayBuffer(buffer) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function sha256(data) {
      const encoder = new TextEncoder();
      const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
      return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function hmacSha256(data, key) {
      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        typeof key === 'string' ? encoder.encode(key) : key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
      return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function getSignatureKey(key, dateStamp, regionName, serviceName) {
      const encoder = new TextEncoder();
      const kDate = await hmacSha256Raw(dateStamp, encoder.encode('AWS4' + key));
      const kRegion = await hmacSha256Raw(regionName, kDate);
      const kService = await hmacSha256Raw(serviceName, kRegion);
      const kSigning = await hmacSha256Raw('aws4_request', kService);
      return kSigning;
    }

    async function hmacSha256Raw(data, key) {
      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      return await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
    }
