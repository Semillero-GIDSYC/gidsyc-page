import { ResearchLine, ResearchPublication } from '../types';

const scholarSearch = (title: string) =>
  `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;

const slugify = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const pub = (
  title: string,
  authors: string[],
  citation: string,
  year: number,
  teamAuthors: string,
  metadata: Partial<ResearchPublication> = {}
): ResearchPublication => ({
  slug: slugify(title),
  title,
  authors,
  citation,
  year,
  googleScholarUrl: scholarSearch(title),
  teamAuthors,
  ...metadata,
});

const PUBLICATIONS = {
  radonArtifactSuppression: pub(
    'Radon-Guided Wavelet-Domain Attention U-Net for Periodic Artifact Suppression in Brain MRI',
    ['Rios-Perez, J. D.', 'Sanchez-Torres, G.', 'Branch-Bedoya, J. W.', 'Laiton-Bonadiez, C. A.'],
    'Rios-Perez, J. D.; Sanchez-Torres, G.; Branch-Bedoya, J. W.; Laiton-Bonadiez, C. A. Radon-Guided Wavelet-Domain Attention U-Net for Periodic Artifact Suppression in Brain MRI. Journal of Imaging, vol. 12, no. 4, art. 153, 2026.',
    2026,
    'Jesús David Ríos Pérez, Camilo Andrés Laiton Bonadiez',
    {
      abstract: 'This work proposes a Radon-guided wavelet-domain attention U-Net to suppress synthetic periodic artifacts in brain MRI while preserving structural fidelity.',
      doi: '10.3390/jimaging12040153',
      sourceUrl: 'https://www.mdpi.com/2313-433X/12/4/153',
      pdfUrl: 'https://www.mdpi.com/2313-433X/12/4/153/pdf',
      journalTitle: 'Journal of Imaging',
      volume: '12',
      issue: '4',
    }
  ),
  deep3dBrainSegmentation: pub(
    'Deep 3D Neural Network for Brain Structures Segmentation Using Self-Attention Modules in MRI Images',
    ['Laiton-Bonadiez, C.', 'Sanchez-Torres, G.', 'Branch-Bedoya, J.'],
    'Laiton-Bonadiez, C.; Sanchez-Torres, G.; Branch-Bedoya, J. Deep 3D Neural Network for Brain Structures Segmentation Using Self-Attention Modules in MRI Images. Sensors, vol. 22, no. 7, art. 2559, 2022.',
    2022,
    'Camilo Andrés Laiton Bonadiez',
    {
      abstract: 'This article presents a 3D deep-learning approach with self-attention modules for segmenting brain structures from MRI volumes.',
      doi: '10.3390/s22072559',
      sourceUrl: 'https://www.mdpi.com/1424-8220/22/7/2559',
      pdfUrl: 'https://www.mdpi.com/1424-8220/22/7/2559/pdf',
      journalTitle: 'Sensors',
      volume: '22',
      issue: '7',
    }
  ),
  deep3dBrainSegmentationCorrection: pub(
    'Correction: Laiton-Bonadiez et al. Deep 3D Neural Network for Brain Structures Segmentation Using Self-Attention Modules in MRI Images. Sensors 2022, 22, 2559',
    ['Laiton-Bonadiez, C.', 'Sanchez-Torres, G.', 'Branch-Bedoya, J.'],
    'Laiton-Bonadiez, C.; Sanchez-Torres, G.; Branch-Bedoya, J. Correction: Laiton-Bonadiez et al. Deep 3D Neural Network for Brain Structures Segmentation Using Self-Attention Modules in MRI Images. Sensors 2022, 22, 2559. Sensors, vol. 26, no. 3, art. 1030, 2026.',
    2026,
    'Camilo Andrés Laiton Bonadiez',
    {
      abstract: 'Correction notice associated with the Sensors article on deep 3D neural networks for brain-structure segmentation using self-attention modules.',
      doi: '10.3390/s26031030',
      sourceUrl: 'https://www.mdpi.com/1424-8220/26/3/1030',
      pdfUrl: 'https://www.mdpi.com/1424-8220/26/3/1030/pdf',
      journalTitle: 'Sensors',
      volume: '26',
      issue: '3',
    }
  ),
  mriArtifactScopingReview: pub(
    'Exploring Methods for MRI Artifact Correction: A Scoping Review',
    ['Rios Perez, J. D.', 'Sanchez Torres, G.', 'Branch Bedoya, J.'],
    'Rios Perez, J. D.; Sanchez Torres, G.; Branch Bedoya, J. Exploring Methods for MRI Artifact Correction: A Scoping Review. Prospectiva, vol. 24, no. 1, 2026.',
    2026,
    'Jesús David Ríos Pérez',
    {
      abstract: 'A PRISMA-ScR-aligned review mapping MRI artifact-correction strategies, evaluation metrics, method families, and evidence gaps.',
      doi: '10.15665/rp.v24i1.3853',
      sourceUrl: 'https://ojs.uac.edu.co/index.php/prospectiva/en/article/view/3853',
      journalTitle: 'Prospectiva',
      volume: '24',
      issue: '1',
    }
  ),
  cleanArchitectureAndroid: pub(
    'Contemporary Trends in Software Architecture: Evaluation of Clean Architecture in the Android Ecosystem',
    ['Henriquez-Miranda, C. N.', 'Sanchez-Torres, G.'],
    'Henriquez-Miranda, C. N.; Sanchez-Torres, G. Contemporary Trends in Software Architecture: Evaluation of Clean Architecture in the Android Ecosystem. Respuestas, vol. 31, no. 1, pp. 75-85, 2026.',
    2026,
    'Carlos Henríquez Miranda',
    {
      abstract: 'A case study evaluating Clean Architecture in Android development through contemporary software-architecture literature and practical adoption patterns.',
      doi: '10.22463/0122820X.5627',
      sourceUrl: 'https://revistas.ufps.edu.co/index.php/respuestas/article/view/5627',
      pdfUrl: 'https://revistas.ufps.edu.co/index.php/respuestas/article/download/5627/6559/52240',
      journalTitle: 'Respuestas',
      volume: '31',
      issue: '1',
      firstPage: '75',
      lastPage: '85',
    }
  ),
  cotEvaluation: pub(
    'Multi-Dimensional Evaluation of Auto-Generated Chain-of-Thought Traces in Reasoning Models',
    ['Becerra-Monsalve, L. F.', 'Sanchez-Torres, G.', 'Branch-Bedoya, J. W.'],
    'Becerra-Monsalve, L. F.; Sanchez-Torres, G.; Branch-Bedoya, J. W. Multi-Dimensional Evaluation of Auto-Generated Chain-of-Thought Traces in Reasoning Models. AI, vol. 7, no. 1, art. 35, 2026.',
    2026,
    'Luis Felipe Becerra Monsalve',
    {
      abstract: 'This study evaluates auto-generated chain-of-thought traces in reasoning models through multidimensional automatic, logic-based, and expert-oriented criteria.',
      doi: '10.3390/ai7010035',
      sourceUrl: 'https://www.mdpi.com/2673-2688/7/1/35',
      pdfUrl: 'https://www.mdpi.com/2673-2688/7/1/35/pdf',
      journalTitle: 'AI',
      volume: '7',
      issue: '1',
    }
  ),
  grayMatterSegmentation: pub(
    'Self-Attention Encoder-Decoder for Gray-Matter Segmentation in Brain MRI',
    ['Laiton Bonadiez, C. A.', 'Sánchez Torres, G.', 'Henríquez Miranda, C. N.'],
    'Laiton Bonadiez, C. A.; Sánchez Torres, G.; Henríquez Miranda, C. N. Self-Attention Encoder-Decoder for Gray-Matter Segmentation in Brain MRI. Revista Colombiana de Tecnologías de Avanzada, vol. 1, no. 47, pp. 1-12, 2026.',
    2026,
    'Camilo Andrés Laiton Bonadiez, Carlos Henríquez Miranda',
    {
      abstract: 'This article proposes a 3D encoder-decoder pipeline with global self-attention and multiscale skip connections for gray-matter segmentation in brain MRI.',
      doi: '10.24054/rcta.v1i47.4282',
      sourceUrl: 'https://ojs.unipamplona.edu.co/index.php/rcta/article/view/4282',
      pdfUrl: 'https://ojs.unipamplona.edu.co/rcta/article/download/4282/8484/21490',
      journalTitle: 'Revista Colombiana de Tecnologías de Avanzada',
      volume: '1',
      issue: '47',
      firstPage: '1',
      lastPage: '12',
    }
  ),
  voiceUml: pub(
    'Voice Driven UML Modeling System for Visually Impaired Students in Software Engineering Education',
    ['Henriquez Miranda, C.', 'Sanchez Cataño, M. A.', 'Sanchez-Torres, G.'],
    'Henriquez Miranda, C.; Sanchez Cataño, M. A.; Sanchez-Torres, G. Voice Driven UML Modeling System for Visually Impaired Students in Software Engineering Education. Revista Colombiana de Tecnologías de Avanzada, vol. 2, no. 46, pp. 171-180, 2025.',
    2025,
    'Carlos Henríquez Miranda, Malak Andrés Sánchez Cataño',
    {
      abstract: 'This work designs and validates a voice-controlled UML modeling system that supports visually impaired students in software-engineering education.',
      doi: '10.24054/rcta.v2i46.4126',
      sourceUrl: 'https://ojs.unipamplona.edu.co/rcta/article/view/4126',
      pdfUrl: 'https://ojs.unipamplona.edu.co/index.php/rcta/article/download/4126/8260/20749',
      journalTitle: 'Revista Colombiana de Tecnologías de Avanzada',
      volume: '2',
      issue: '46',
      firstPage: '171',
      lastPage: '180',
    }
  ),
  realEstateReview: pub(
    'Recommender systems in real estate: a systematic review',
    ['Henríquez-Miranda, C.', 'Ríos-Pérez, J.', 'Sánchez-Torres, G.'],
    'Henríquez-Miranda, C.; Ríos-Pérez, J.; Sánchez-Torres, G. Recommender systems in real estate: a systematic review. Bulletin of Electrical Engineering and Informatics, vol. 14, no. 3, pp. 2156-2170, 2025.',
    2025,
    'Carlos Henríquez Miranda, Jesús David Ríos Pérez',
    {
      abstract: 'A PRISMA-based systematic review of real-estate recommender systems, including filtering strategies, deep-learning approaches, challenges, and future research directions.',
      doi: '10.11591/eei.v14i3.8884',
      sourceUrl: 'https://www.beei.org/index.php/EEI/article/view/8884',
      pdfUrl: 'https://beei.org/index.php/EEI/article/download/8884/4234',
      journalTitle: 'Bulletin of Electrical Engineering and Informatics',
      volume: '14',
      issue: '3',
      firstPage: '2156',
      lastPage: '2170',
    }
  ),
  incepta: pub(
    'INCEPTA: Iterative Software Engineering Framework that Integrates Agile and Traditional Practices from an Educational Perspective',
    ['Henriquez-Miranda, C.', 'Sanchez-Torres, G.'],
    'Henriquez-Miranda, C.; Sanchez-Torres, G. INCEPTA: Iterative Software Engineering Framework that Integrates Agile and Traditional Practices from an Educational Perspective. Journal of Computer and Electronic Sciences: Theory and Applications, vol. 6, no. 1, pp. 3-12, 2025.',
    2025,
    'Carlos Henríquez Miranda',
    {
      abstract: 'INCEPTA introduces an iterative framework that combines agile and traditional software-engineering practices from an educational perspective.',
      doi: '10.17981/cesta.06.01.2025.01',
      sourceUrl: 'https://revistascientificas.cuc.edu.co/CESTA/article/view/6414',
      pdfUrl: 'https://revistascientificas.cuc.edu.co/CESTA/article/download/6414/5703',
      journalTitle: 'Journal of Computer and Electronic Sciences: Theory and Applications',
      volume: '6',
      issue: '1',
      firstPage: '3',
      lastPage: '12',
    }
  ),
  trafficAccidentVit: pub(
    'A Multi-Modal ViT-Based Deep Learning Architecture for Binary Classification of Traffic Accident',
    ['Rios Perez, J. D.', 'Sanchez Torres, G.', 'Henriquez Miranda, C.'],
    'Rios Perez, J. D.; Sanchez Torres, G.; Henriquez Miranda, C. A Multi-Modal ViT-Based Deep Learning Architecture for Binary Classification of Traffic Accident. Revista Colombiana de Tecnologías de Avanzada, vol. 1, no. 45, pp. 225-239, 2025.',
    2025,
    'Jesús David Ríos Pérez, Carlos Henríquez Miranda',
    {
      abstract: 'This article proposes a multimodal Vision Transformer-based architecture for binary traffic-accident classification using heterogeneous data sources.',
      doi: '10.24054/rcta.v1i45.3751',
      sourceUrl: 'https://ojs.unipamplona.edu.co/index.php/rcta/article/view/3751',
      pdfUrl: 'https://ojs.unipamplona.edu.co/rcta/article/download/3751/7968',
      journalTitle: 'Revista Colombiana de Tecnologías de Avanzada',
      volume: '1',
      issue: '45',
      firstPage: '225',
      lastPage: '239',
    }
  ),
  netflixArchitecture: pub(
    'Architectural Evolution from Monolithic to Microservices in Scalable Systems: A Case Study of Netflix',
    ['Henríquez, C.', 'Ramón Valencia, J. D.', 'Sánchez Torres, G.'],
    'Henríquez, C.; Ramón Valencia, J. D.; Sánchez Torres, G. Architectural Evolution from Monolithic to Microservices in Scalable Systems: A Case Study of Netflix. Prospectiva, vol. 23, no. 1, 2025.',
    2025,
    'Carlos Henríquez Miranda, Jarol Derley Ramón Valencia',
    {
      abstract: 'A case study of Netflix examining its architectural evolution from monolithic systems to microservices and the implications for scalability and resilience.',
      doi: '10.15665/rp.v23i1.3683',
      sourceUrl: 'https://ojs.uac.edu.co/index.php/prospectiva/article/view/3683',
      pdfUrl: 'https://ojs.uac.edu.co/index.php/prospectiva/en/article/download/3683/2827/16162',
      journalTitle: 'Prospectiva',
      volume: '23',
      issue: '1',
    }
  ),
  greenSoftware: pub(
    'Exploring Recent Technical, Methodological, and Organizational Perspectives on Green Software Practices',
    ['Henríquez Miranda, C.', 'Sánchez Torres, G.'],
    'Henríquez Miranda, C.; Sánchez Torres, G. Exploring Recent Technical, Methodological, and Organizational Perspectives on Green Software Practices. Revista Ambiental Agua, Aire y Suelo, vol. 16, no. 1, pp. 31-44, 2025.',
    2025,
    'Carlos Henríquez Miranda',
    {
      abstract: 'This article reviews technical, methodological, and organizational perspectives related to green software and environmentally sustainable software practices.',
      sourceUrl: 'https://ojs.unipamplona.edu.co/index.php/aaas/en/article/view/3706',
      pdfUrl: 'https://ojs.unipamplona.edu.co/index.php/aaas/en/article/download/3706/7884/17066',
      journalTitle: 'Revista Ambiental Agua, Aire y Suelo',
      volume: '16',
      issue: '1',
      firstPage: '31',
      lastPage: '44',
    }
  ),
  environmentalAi: pub(
    'Applications of Artificial Intelligence in Environmental Monitoring and Conservation: An Exploratory Review',
    ['Henríquez-Miranda, C.', 'Ríos-Pérez, J. D.', 'Sánchez-Torres, G.'],
    'Henríquez-Miranda, C.; Ríos-Pérez, J. D.; Sánchez-Torres, G. Applications of Artificial Intelligence in Environmental Monitoring and Conservation: An Exploratory Review. Revista Ambiental Agua, Aire y Suelo, vol. 15, no. 2, pp. 48-68, 2024.',
    2024,
    'Carlos Henríquez Miranda, Jesús David Ríos Pérez',
    {
      abstract: 'An exploratory review of artificial-intelligence applications for environmental monitoring and conservation across water, air, and soil domains.',
      sourceUrl: 'https://ojs.unipamplona.edu.co/index.php/aaas/en/article/view/3189',
      pdfUrl: 'https://ojs.unipamplona.edu.co/index.php/aaas/en/article/download/3189/7435',
      journalTitle: 'Revista Ambiental Agua, Aire y Suelo',
      volume: '15',
      issue: '2',
      firstPage: '48',
      lastPage: '68',
    }
  ),
  professorAlex: pub(
    'Toward the improvement of teaching in object-oriented programming: the integration of intelligent chatbot assistance and professor Alex\'s implementation',
    ['Henriquez Miranda, C.', 'Ríos Pérez, J. D.', 'Sanchez-Torres, G.'],
    'Henriquez Miranda, C.; Ríos Pérez, J. D.; Sanchez-Torres, G. Toward the improvement of teaching in object-oriented programming: the integration of intelligent chatbot assistance and professor Alex\'s implementation. Revista Colombiana de Tecnologías de Avanzada, vol. 1, no. 43, pp. 134-143, 2024.',
    2024,
    'Carlos Henríquez Miranda, Jesús David Ríos Pérez',
    {
      abstract: 'This article evaluates the integration of intelligent chatbot support and the Professor Alex implementation for improving object-oriented programming education.',
      doi: '10.24054/rcta.v1i43.2803',
      sourceUrl: 'https://ojs.unipamplona.edu.co/index.php/rcta/article/view/2803',
      pdfUrl: 'https://ojs.unipamplona.edu.co/index.php/rcta/article/download/2803/6280',
      journalTitle: 'Revista Colombiana de Tecnologías de Avanzada',
      volume: '1',
      issue: '43',
      firstPage: '134',
      lastPage: '143',
    }
  ),
  realEstateHybrid: pub(
    'Implementation and Evaluation of a Hybrid Recommendation System for the Real Estate Market',
    ['Henríquez Miranda, C.', 'Sánchez-Torres, G.'],
    'Henríquez Miranda, C.; Sánchez-Torres, G. Implementation and Evaluation of a Hybrid Recommendation System for the Real Estate Market. Data and Metadata, vol. 3, art. 426, 2024.',
    2024,
    'Carlos Henríquez Miranda',
    {
      abstract: 'This work implements and evaluates a hybrid recommendation system for the real-estate market, combining collaborative and content-based filtering.',
      doi: '10.56294/dm2024.426',
      sourceUrl: 'https://dm.ageditor.ar/index.php/dm/article/view/426',
      pdfUrl: 'https://dm.ageditor.ar/index.php/dm/article/download/426/702/3260',
      journalTitle: 'Data and Metadata',
      volume: '3',
    }
  ),
  llmFinance: pub(
    'Integration of Large Language Models in Mobile Applications for Statutory Auditing and Finance',
    ['Robles Serrano, S.', 'Rios Perez, J.', 'Sánchez Torres, G.'],
    'Robles Serrano, S.; Rios Perez, J.; Sánchez Torres, G. Integration of Large Language Models in Mobile Applications for Statutory Auditing and Finance. Prospectiva, vol. 22, no. 1, 2024.',
    2024,
    'Sergio Robles Serrano, Jesús David Ríos Pérez',
    {
      abstract: 'This article proposes a mobile-application architecture that integrates semantic search and large language models for statutory auditing and finance.',
      doi: '10.15665/rp.v22i1.3334',
      sourceUrl: 'https://ojs.uac.edu.co/index.php/prospectiva/en/article/view/3334',
      pdfUrl: 'https://dialnet.unirioja.es/descarga/articulo/9342905.pdf',
      journalTitle: 'Prospectiva',
      volume: '22',
      issue: '1',
      firstPage: '27',
      lastPage: '41',
    }
  ),
  semanticVoiceAssistants: pub(
    'Semantic Search and LLMs for Building Voice-Based Digital Assistants',
    ['Sánchez Torres, G.', 'Ríos Pérez, J. D.', 'Rincones Solano, C. D.', 'Oñate Acuña, D. D.', 'Vizcaíno Macías, J. E.'],
    'Sánchez Torres, G.; Ríos Pérez, J. D.; Rincones Solano, C. D.; Oñate Acuña, D. D.; Vizcaíno Macías, J. E. Semantic Search and LLMs for Building Voice-Based Digital Assistants. En La Geografía Humana, Ciencia, Tecnología e Industria en la Sociedad Digital, Tomo VI, Editorial TEINCO, 2025.',
    2025,
    'Jesús David Ríos Pérez, Carlos David Rincones Solano, Diego David Oñate Acuña, Jonathan Enrique Vizcaíno Macías',
    {
      abstract: 'This work addresses semantic search and large language models as components for building voice-based digital assistants.',
      sourceUrl: 'https://scholar.google.com/scholar?q=Semantic%20Search%20and%20LLMs%20for%20Building%20Voice-Based%20Digital%20Assistants',
      journalTitle: 'La Geografía Humana, Ciencia, Tecnología e Industria en la Sociedad Digital',
      volume: 'VI',
    }
  ),
};

export const RESEARCH_LINES: ResearchLine[] = [
  {
    id: 'modelos-razonamiento',
    title: 'Modelos de razonamiento',
    publications: [
      PUBLICATIONS.cotEvaluation,
      PUBLICATIONS.semanticVoiceAssistants,
      PUBLICATIONS.voiceUml,
      PUBLICATIONS.llmFinance,
    ],
  },
  {
    id: 'agentes-inteligentes',
    title: 'Agentes inteligentes y sistemas autónomos de IA',
    publications: [
      PUBLICATIONS.semanticVoiceAssistants,
      PUBLICATIONS.voiceUml,
      PUBLICATIONS.realEstateReview,
      PUBLICATIONS.trafficAccidentVit,
      PUBLICATIONS.professorAlex,
      PUBLICATIONS.realEstateHybrid,
      PUBLICATIONS.llmFinance,
    ],
  },
  {
    id: 'ia-eficiente',
    title: 'IA eficiente, infraestructura computacional y sostenibilidad energética',
    publications: [
      PUBLICATIONS.cleanArchitectureAndroid,
      PUBLICATIONS.greenSoftware,
      PUBLICATIONS.incepta,
      PUBLICATIONS.netflixArchitecture,
    ],
  },
  {
    id: 'ia-aplicada',
    title: 'IA aplicada a ciencia, ingeniería y datos complejos',
    publications: [
      PUBLICATIONS.radonArtifactSuppression,
      PUBLICATIONS.deep3dBrainSegmentationCorrection,
      PUBLICATIONS.mriArtifactScopingReview,
      PUBLICATIONS.grayMatterSegmentation,
      PUBLICATIONS.voiceUml,
      PUBLICATIONS.realEstateReview,
      PUBLICATIONS.trafficAccidentVit,
      PUBLICATIONS.semanticVoiceAssistants,
      PUBLICATIONS.environmentalAi,
      PUBLICATIONS.professorAlex,
      PUBLICATIONS.realEstateHybrid,
      PUBLICATIONS.llmFinance,
      PUBLICATIONS.deep3dBrainSegmentation,
    ],
  },
];
