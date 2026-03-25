-- =============================================================================
-- Seed: Fake PIs and Research Positions
-- Run this in the Supabase SQL Editor (runs as superuser, bypasses RLS).
-- Safe to run multiple times — uses DO block with existence checks.
-- =============================================================================

DO $$
DECLARE
  pi1_user_id   uuid;
  pi2_user_id   uuid;
  pi3_user_id   uuid;
  pi4_user_id   uuid;
  pi5_user_id   uuid;
  pi6_user_id   uuid;

  pi1_id uuid;
  pi2_id uuid;
  pi3_id uuid;
  pi4_id uuid;
  pi5_id uuid;
  pi6_id uuid;
BEGIN

  -- ── PI Users ──────────────────────────────────────────────────────────────

  INSERT INTO users (email, password_hash, role, first_name, last_name)
  VALUES ('chen.wei@ufl.edu', crypt('demo1234', gen_salt('bf')), 'pi', 'Wei', 'Chen')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO pi1_user_id;
  IF pi1_user_id IS NULL THEN
    SELECT id INTO pi1_user_id FROM users WHERE email = 'chen.wei@ufl.edu';
  END IF;

  INSERT INTO users (email, password_hash, role, first_name, last_name)
  VALUES ('priya.nair@ufl.edu', crypt('demo1234', gen_salt('bf')), 'pi', 'Priya', 'Nair')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO pi2_user_id;
  IF pi2_user_id IS NULL THEN
    SELECT id INTO pi2_user_id FROM users WHERE email = 'priya.nair@ufl.edu';
  END IF;

  INSERT INTO users (email, password_hash, role, first_name, last_name)
  VALUES ('marcus.bell@ufl.edu', crypt('demo1234', gen_salt('bf')), 'pi', 'Marcus', 'Bell')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO pi3_user_id;
  IF pi3_user_id IS NULL THEN
    SELECT id INTO pi3_user_id FROM users WHERE email = 'marcus.bell@ufl.edu';
  END IF;

  INSERT INTO users (email, password_hash, role, first_name, last_name)
  VALUES ('sofia.reyes@ufl.edu', crypt('demo1234', gen_salt('bf')), 'pi', 'Sofia', 'Reyes')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO pi4_user_id;
  IF pi4_user_id IS NULL THEN
    SELECT id INTO pi4_user_id FROM users WHERE email = 'sofia.reyes@ufl.edu';
  END IF;

  INSERT INTO users (email, password_hash, role, first_name, last_name)
  VALUES ('james.okafor@ufl.edu', crypt('demo1234', gen_salt('bf')), 'pi', 'James', 'Okafor')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO pi5_user_id;
  IF pi5_user_id IS NULL THEN
    SELECT id INTO pi5_user_id FROM users WHERE email = 'james.okafor@ufl.edu';
  END IF;

  INSERT INTO users (email, password_hash, role, first_name, last_name)
  VALUES ('lisa.huang@ufl.edu', crypt('demo1234', gen_salt('bf')), 'pi', 'Lisa', 'Huang')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO pi6_user_id;
  IF pi6_user_id IS NULL THEN
    SELECT id INTO pi6_user_id FROM users WHERE email = 'lisa.huang@ufl.edu';
  END IF;

  -- ── PI Profiles ───────────────────────────────────────────────────────────

  INSERT INTO pi_profiles (user_id, department, lab_name, research_areas, lab_website)
  VALUES (pi1_user_id, 'Computer & Information Science & Engineering', 'UF Intelligent Systems Lab',
          ARRAY['Machine Learning', 'Computer Vision', 'Robotics'], 'https://isl.cise.ufl.edu')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO pi1_id;
  IF pi1_id IS NULL THEN SELECT id INTO pi1_id FROM pi_profiles WHERE user_id = pi1_user_id; END IF;

  INSERT INTO pi_profiles (user_id, department, lab_name, research_areas, lab_website)
  VALUES (pi2_user_id, 'Biology', 'UF Genomics & Computational Biology Lab',
          ARRAY['Genomics', 'Bioinformatics', 'Molecular Biology'], 'https://gcbl.biology.ufl.edu')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO pi2_id;
  IF pi2_id IS NULL THEN SELECT id INTO pi2_id FROM pi_profiles WHERE user_id = pi2_user_id; END IF;

  INSERT INTO pi_profiles (user_id, department, lab_name, research_areas, lab_website)
  VALUES (pi3_user_id, 'Psychology', 'UF Cognitive Neuroscience Lab',
          ARRAY['Cognitive Neuroscience', 'Behavioral Research', 'Neuroimaging'], 'https://cnl.psych.ufl.edu')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO pi3_id;
  IF pi3_id IS NULL THEN SELECT id INTO pi3_id FROM pi_profiles WHERE user_id = pi3_user_id; END IF;

  INSERT INTO pi_profiles (user_id, department, lab_name, research_areas, lab_website)
  VALUES (pi4_user_id, 'Chemistry', 'UF Materials & Nanoscience Lab',
          ARRAY['Nanomaterials', 'Organic Chemistry', 'Spectroscopy'], 'https://mnl.chem.ufl.edu')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO pi4_id;
  IF pi4_id IS NULL THEN SELECT id INTO pi4_id FROM pi_profiles WHERE user_id = pi4_user_id; END IF;

  INSERT INTO pi_profiles (user_id, department, lab_name, research_areas, lab_website)
  VALUES (pi5_user_id, 'Biomedical Engineering', 'UF Neural Engineering Lab',
          ARRAY['Neural Interfaces', 'Signal Processing', 'Biomedical Devices'], 'https://nel.bme.ufl.edu')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO pi5_id;
  IF pi5_id IS NULL THEN SELECT id INTO pi5_id FROM pi_profiles WHERE user_id = pi5_user_id; END IF;

  INSERT INTO pi_profiles (user_id, department, lab_name, research_areas, lab_website)
  VALUES (pi6_user_id, 'Computer & Information Science & Engineering', 'UF Systems & Security Lab',
          ARRAY['Cybersecurity', 'Distributed Systems', 'Network Security'], 'https://ssl.cise.ufl.edu')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO pi6_id;
  IF pi6_id IS NULL THEN SELECT id INTO pi6_id FROM pi_profiles WHERE user_id = pi6_user_id; END IF;

  -- ── Research Positions ────────────────────────────────────────────────────

  -- PI 1: Computer Vision / ML
  INSERT INTO research_positions (pi_id, title, description, required_skills, min_gpa, compensation_type, time_commitment, deadline, status)
  VALUES
  (pi1_id,
   'Deep Learning Research Assistant – Object Detection',
   'Join our lab to develop and evaluate state-of-the-art object detection models for autonomous vehicle perception. You will implement transformer-based architectures, run experiments on our GPU cluster, and help write research papers. Prior experience training neural networks is strongly preferred.',
   ARRAY['Python', 'PyTorch', 'Deep Learning', 'Computer Vision', 'Git'],
   3.3, 'stipend', '15–20 hrs/week', now() + interval '60 days', 'open'),

  (pi1_id,
   'Reinforcement Learning Research Assistant',
   'We are looking for an undergraduate or graduate student to assist with sim-to-real transfer research in robotic manipulation. Tasks include implementing RL algorithms (PPO, SAC), running simulations in Isaac Gym, and analyzing results. Strong math background required.',
   ARRAY['Python', 'PyTorch', 'Reinforcement Learning', 'Linear Algebra', 'ROS'],
   3.5, 'stipend', '20 hrs/week', now() + interval '45 days', 'open'),

  (pi1_id,
   'Computer Vision Data Annotation & Pipeline Engineer',
   'Help build and maintain our data pipeline for large-scale image datasets. Responsibilities include writing data loaders, automating annotation workflows, and benchmarking model performance. Great entry point for students new to ML research.',
   ARRAY['Python', 'OpenCV', 'SQL', 'Bash'],
   3.0, 'credit', '10 hrs/week', now() + interval '30 days', 'open');

  -- PI 2: Genomics / Bioinformatics
  INSERT INTO research_positions (pi_id, title, description, required_skills, min_gpa, compensation_type, time_commitment, deadline, status)
  VALUES
  (pi2_id,
   'Bioinformatics Research Assistant – RNA-seq Analysis',
   'Assist with bulk and single-cell RNA-seq data analysis to understand gene expression changes in cancer cell lines. You will use R/Bioconductor pipelines, visualize results, and contribute to manuscript figures. Background in biology and some coding experience required.',
   ARRAY['R', 'Python', 'Bioinformatics', 'Statistics', 'Linux'],
   3.2, 'paid', '12–15 hrs/week', now() + interval '50 days', 'open'),

  (pi2_id,
   'Computational Genomics Co-op – Machine Learning on Omics Data',
   'Work with large multi-omics datasets (WGS, WES, ATAC-seq) to build predictive models for disease susceptibility. Responsibilities include feature engineering, model training, and cross-validation. Strong Python and statistics background required.',
   ARRAY['Python', 'Machine Learning', 'Genomics', 'Statistics', 'Pandas', 'Scikit-learn'],
   3.4, 'paid', '20 hrs/week', now() + interval '40 days', 'open'),

  (pi2_id,
   'Wet Lab Research Assistant – CRISPR Functional Genomics',
   'Assist with CRISPR screen experiments targeting regulatory elements in primary immune cells. Duties include cell culture, lentiviral transduction, flow cytometry, and library prep for NGS. Training will be provided for most techniques.',
   ARRAY['Cell Culture', 'PCR', 'Flow Cytometry', 'Pipetting', 'Lab Safety'],
   3.0, 'credit', '15 hrs/week', now() + interval '35 days', 'open');

  -- PI 3: Cognitive Neuroscience / Psychology
  INSERT INTO research_positions (pi_id, title, description, required_skills, min_gpa, compensation_type, time_commitment, deadline, status)
  VALUES
  (pi3_id,
   'fMRI Data Analysis Research Assistant',
   'Support neuroimaging studies investigating attention and working memory. You will preprocess fMRI data using FSL/SPM, run GLM analyses, and assist with figure preparation. Experience with any neuroimaging toolbox is a plus but not required.',
   ARRAY['MATLAB', 'Python', 'Statistics', 'Neuroimaging', 'Data Analysis'],
   3.3, 'credit', '10 hrs/week', now() + interval '55 days', 'open'),

  (pi3_id,
   'Behavioral Research Assistant – Decision Making Studies',
   'Recruit and run human subjects through computerized decision-making experiments. Duties include scheduling participants, administering tasks in PsychoPy, entering data, and assisting with IRB documentation. No prior research experience required.',
   ARRAY['PsychoPy', 'Data Entry', 'Communication', 'IRB Compliance'],
   2.8, 'credit', '8–10 hrs/week', now() + interval '25 days', 'open'),

  (pi3_id,
   'EEG & Cognitive Neuroscience Research Assistant',
   'Help set up and run EEG recording sessions for studies on auditory perception and cognitive load. Responsibilities include participant preparation, impedance checks, signal monitoring, and preliminary preprocessing with EEGLAB. Will be trained on all equipment.',
   ARRAY['MATLAB', 'EEGLAB', 'Data Collection', 'Attention to Detail'],
   3.0, 'stipend', '12 hrs/week', now() + interval '45 days', 'open');

  -- PI 4: Chemistry / Materials Science
  INSERT INTO research_positions (pi_id, title, description, required_skills, min_gpa, compensation_type, time_commitment, deadline, status)
  VALUES
  (pi4_id,
   'Undergraduate Research Assistant – Nanoparticle Synthesis',
   'Synthesize and characterize metal oxide nanoparticles for drug delivery applications. You will perform TEM/SEM imaging, DLS measurements, and surface functionalization reactions. Lab safety training and general chemistry coursework required.',
   ARRAY['Organic Chemistry', 'Lab Safety', 'Spectroscopy', 'Data Analysis'],
   3.1, 'paid', '15 hrs/week', now() + interval '30 days', 'open'),

  (pi4_id,
   'Computational Chemistry Research Assistant – DFT Simulations',
   'Run density functional theory (DFT) calculations to model reaction pathways for novel photocatalysts. You will use VASP and Gaussian on HiPerGator, analyze electronic structure data, and contribute to publications.',
   ARRAY['Python', 'Linux', 'Physical Chemistry', 'VASP', 'Gaussian', 'HPC'],
   3.5, 'stipend', '20 hrs/week', now() + interval '50 days', 'open');

  -- PI 5: Biomedical Engineering
  INSERT INTO research_positions (pi_id, title, description, required_skills, min_gpa, compensation_type, time_commitment, deadline, status)
  VALUES
  (pi5_id,
   'Neural Signal Processing Research Assistant',
   'Develop algorithms for decoding motor intent from multi-electrode array recordings in non-human primates. Responsibilities include spike sorting, feature extraction, and offline decoder evaluation in MATLAB/Python. Strong DSP background preferred.',
   ARRAY['MATLAB', 'Python', 'Signal Processing', 'NumPy', 'Statistics'],
   3.4, 'paid', '20 hrs/week', now() + interval '60 days', 'open'),

  (pi5_id,
   'PCB Design & Embedded Systems Assistant – Implantable Device',
   'Help design and test PCBs for a low-power wireless neural recording device. You will use KiCad for schematic capture and layout, write firmware in C/C++ for STM32 MCUs, and conduct bench testing. Electronics coursework required.',
   ARRAY['KiCad', 'C', 'C++', 'Embedded Systems', 'Electronics', 'Soldering'],
   3.2, 'stipend', '15–20 hrs/week', now() + interval '45 days', 'open'),

  (pi5_id,
   'Clinical Data Analysis Assistant – Brain-Computer Interface Study',
   'Analyze electrocorticography (ECoG) data from a clinical BCI trial. You will clean datasets, run statistical tests, generate visualizations, and assist writing the results section of a journal article. Python and statistics background required.',
   ARRAY['Python', 'Statistics', 'Pandas', 'Matplotlib', 'Clinical Research'],
   3.3, 'credit', '10–12 hrs/week', now() + interval '40 days', 'open');

  -- PI 6: Cybersecurity / Systems
  INSERT INTO research_positions (pi_id, title, description, required_skills, min_gpa, compensation_type, time_commitment, deadline, status)
  VALUES
  (pi6_id,
   'Security Research Assistant – Fuzzing & Vulnerability Discovery',
   'Contribute to a NSF-funded project on automated vulnerability discovery in open-source software. You will write fuzzing harnesses using libFuzzer/AFL++, triage crashes, and help develop a corpus of CVE-related test cases. OS and systems programming background required.',
   ARRAY['C', 'C++', 'Linux', 'Python', 'Assembly', 'GDB'],
   3.3, 'stipend', '20 hrs/week', now() + interval '55 days', 'open'),

  (pi6_id,
   'Distributed Systems Research Assistant – Consensus Protocols',
   'Implement and evaluate variants of consensus algorithms (Raft, Paxos, HotStuff) in a fault-injection testbed. You will write Go/Rust code, design experiments to measure throughput and latency, and analyze failure modes.',
   ARRAY['Go', 'Rust', 'Distributed Systems', 'Networking', 'Linux', 'Git'],
   3.5, 'paid', '20 hrs/week', now() + interval '50 days', 'open'),

  (pi6_id,
   'Network Security Research Assistant – Traffic Analysis',
   'Build ML classifiers to detect malicious traffic patterns in large packet capture datasets. Responsibilities include feature extraction with Scapy/Zeek, training classifiers in Python, and evaluating detection rates against real-world attack traces.',
   ARRAY['Python', 'Machine Learning', 'Networking', 'Wireshark', 'Scikit-learn'],
   3.0, 'credit', '10–15 hrs/week', now() + interval '35 days', 'open'),

  (pi6_id,
   'Undergraduate Research Assistant – Secure Multi-Party Computation',
   'Explore practical applications of SMPC and homomorphic encryption for privacy-preserving data analysis. No prior cryptography experience needed — we will teach you. Strong math background (discrete math, linear algebra) required.',
   ARRAY['Python', 'Mathematics', 'Cryptography', 'Discrete Math'],
   3.6, 'paid', '15 hrs/week', now() + interval '60 days', 'open');

  RAISE NOTICE 'Seed complete — 6 PIs and 18 positions inserted.';
END;
$$;
