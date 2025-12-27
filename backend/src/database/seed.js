const db = require('./connection');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        console.log('🌱 Starting database seeding...');

        // 1. Create Admin User
        const adminPasswordHash = await bcrypt.hash('Zygote@123', 10);
        const adminResult = await db.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET password_hash = $2
      RETURNING id
    `, ['zygote72@gmail.com', adminPasswordHash, 'Admin User', 'admin', true, true]);

        const adminId = adminResult.rows[0].id;
        console.log('✅ Admin user created');

        // 2. Create Tracks
        const track1 = await db.query(`
      INSERT INTO tracks (name, description, year_number, display_order, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, ['First Year MBBS', 'Foundation of medical sciences', 1, 1, adminId]);

        const track2 = await db.query(`
      INSERT INTO tracks (name, description, year_number, display_order, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, ['Second Year MBBS', 'Pathophysiology and pharmacology', 2, 2, adminId]);

        console.log('✅ Tracks created');

        // 3. Create Subjects
        const anatomy = await db.query(`
      INSERT INTO subjects (track_id, name, description, color_code, display_order, is_free_trial, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [track1.rows[0].id, 'Anatomy', 'Study of human body structure', '#2563EB', 1, true, adminId]);

        const physiology = await db.query(`
      INSERT INTO subjects (track_id, name, description, color_code, display_order, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [track1.rows[0].id, 'Physiology', 'Study of body functions', '#059669', 2, adminId]);

        console.log('✅ Subjects created');

        // 4. Create Topics for Anatomy
        const cardiovascularTopic = await db.query(`
      INSERT INTO topics (subject_id, title, description, display_order, is_free_sample, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [anatomy.rows[0].id, 'Cardiovascular System', 'Heart and blood vessels anatomy', 1, true, adminId]);

        const respiratoryTopic = await db.query(`
      INSERT INTO topics (subject_id, title, description, display_order, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [anatomy.rows[0].id, 'Respiratory System', 'Lungs and airways anatomy', 2, adminId]);

        console.log('✅ Topics created');

        // 5. Create Notes for Cardiovascular System
        await db.query(`
      INSERT INTO notes (topic_id, content, content_type, created_by)
      VALUES ($1, $2, $3, $4)
    `, [cardiovascularTopic.rows[0].id, `# Cardiovascular System

## Overview
The cardiovascular system consists of the heart, blood vessels, and blood. It is responsible for transporting oxygen, nutrients, hormones, and waste products throughout the body.

## Heart Anatomy

### Chambers
- **Right Atrium**: Receives deoxygenated blood from the body via superior and inferior vena cava
- **Right Ventricle**: Pumps deoxygenated blood to the lungs via pulmonary artery
- **Left Atrium**: Receives oxygenated blood from the lungs via pulmonary veins
- **Left Ventricle**: Pumps oxygenated blood to the body via aorta

### Valves
1. **Tricuspid Valve**: Between right atrium and right ventricle
2. **Pulmonary Valve**: Between right ventricle and pulmonary artery
3. **Mitral Valve**: Between left atrium and left ventricle
4. **Aortic Valve**: Between left ventricle and aorta

## Blood Vessels

### Arteries
- Carry blood away from the heart
- Thick, muscular walls
- High pressure system

### Veins
- Carry blood toward the heart
- Thinner walls with valves
- Low pressure system

### Capillaries
- Microscopic vessels
- Site of gas and nutrient exchange
- Connect arteries to veins

## Clinical Significance
Understanding cardiovascular anatomy is essential for diagnosing and treating heart diseases, performing surgeries, and interpreting diagnostic tests like ECG and echocardiography.
`, 'markdown', adminId]);

        console.log('✅ Notes created');

        // 6. Create Summary
        await db.query(`
      INSERT INTO summaries (topic_id, content, content_type, created_by)
      VALUES ($1, $2, $3, $4)
    `, [cardiovascularTopic.rows[0].id, `# Cardiovascular System - Quick Summary

## Key Points
- 4 chambers: 2 atria, 2 ventricles
- 4 valves: Tricuspid, Pulmonary, Mitral, Aortic
- Right side: Deoxygenated blood → Lungs
- Left side: Oxygenated blood → Body

## Blood Flow Pathway
1. Body → Vena Cava → Right Atrium
2. Right Atrium → Tricuspid Valve → Right Ventricle
3. Right Ventricle → Pulmonary Valve → Pulmonary Artery → Lungs
4. Lungs → Pulmonary Veins → Left Atrium
5. Left Atrium → Mitral Valve → Left Ventricle
6. Left Ventricle → Aortic Valve → Aorta → Body

## Remember
- **Arteries** = Away from heart
- **Veins** = Toward heart
- **Left ventricle** has thickest wall (systemic circulation)
`, 'markdown', adminId]);

        console.log('✅ Summary created');

        // 7. Create MCQs
        const mcqs = [
            {
                question: 'Which chamber of the heart receives oxygenated blood from the lungs?',
                a: 'Right Atrium',
                b: 'Right Ventricle',
                c: 'Left Atrium',
                d: 'Left Ventricle',
                correct: 'C',
                explanation: 'The left atrium receives oxygenated blood from the lungs via the pulmonary veins.',
                difficulty: 'easy'
            },
            {
                question: 'Which valve prevents backflow of blood from the left ventricle to the left atrium?',
                a: 'Tricuspid Valve',
                b: 'Mitral Valve',
                c: 'Aortic Valve',
                d: 'Pulmonary Valve',
                correct: 'B',
                explanation: 'The mitral valve (bicuspid valve) is located between the left atrium and left ventricle, preventing backflow during ventricular contraction.',
                difficulty: 'moderate'
            },
            {
                question: 'Which blood vessel carries deoxygenated blood from the right ventricle to the lungs?',
                a: 'Aorta',
                b: 'Pulmonary Vein',
                c: 'Pulmonary Artery',
                d: 'Vena Cava',
                correct: 'C',
                explanation: 'The pulmonary artery is unique as it is the only artery that carries deoxygenated blood (from right ventricle to lungs).',
                difficulty: 'easy'
            },
            {
                question: 'Which chamber of the heart has the thickest myocardial wall?',
                a: 'Right Atrium',
                b: 'Right Ventricle',
                c: 'Left Atrium',
                d: 'Left Ventricle',
                correct: 'D',
                explanation: 'The left ventricle has the thickest wall because it must generate enough pressure to pump blood throughout the entire systemic circulation.',
                difficulty: 'moderate'
            },
            {
                question: 'The sinoatrial (SA) node is located in which chamber?',
                a: 'Right Atrium',
                b: 'Left Atrium',
                c: 'Right Ventricle',
                d: 'Left Ventricle',
                correct: 'A',
                explanation: 'The SA node, the natural pacemaker of the heart, is located in the wall of the right atrium near the opening of the superior vena cava.',
                difficulty: 'hard'
            }
        ];

        for (let i = 0; i < mcqs.length; i++) {
            const mcq = mcqs[i];
            await db.query(`
        INSERT INTO mcqs (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, display_order, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [cardiovascularTopic.rows[0].id, mcq.question, mcq.a, mcq.b, mcq.c, mcq.d, mcq.correct, mcq.explanation, mcq.difficulty, i + 1, adminId]);
        }

        console.log('✅ MCQs created');

        // 8. Create a test student user
        const studentPasswordHash = await bcrypt.hash('Student@123', 10);
        await db.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['student@test.com', studentPasswordHash, 'Test Student', 'student', true, true]);

        console.log('✅ Test student created');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📋 Sample Credentials:');
        console.log('Admin: zygote72@gmail.com / Zygote@123');
        console.log('Student: student@test.com / Student@123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
