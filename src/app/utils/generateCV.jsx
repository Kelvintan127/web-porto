import { Document, Page, Text, View, StyleSheet, pdf, Link, Image } from '@react-pdf/renderer';
import { gpaProgression, skills, experiences, projects, publications, courses } from './globals';

const styles = StyleSheet.create({
  page: {
    padding: '30 40',
    fontSize: 11,
    fontFamily: 'Times-Roman',
    lineHeight: 1.5,
  },
  name: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Times-Bold',
  },
  location: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    color: '#444444',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    fontSize: 10,
    marginBottom: 4,
  },
  section: {
    
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Times-Bold',
    borderBottom: '1 solid black',
    marginBottom: 6,
    paddingBottom: 4,
  },
  bullet: {
    marginLeft: 8,
    marginBottom: 2,
    lineHeight: 1,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 4,
  },
  experienceTitle: {
    fontSize: 13,
    fontFamily: 'Times-Bold',
  },
  experienceDate: {
    fontSize: 12,
    fontFamily: 'Times-Italic',
    color: '#444444',
  },
  projectTitle: {
    fontSize: 13,
    fontFamily: 'Times-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  skillsSection: {
    marginBottom: 4,
  },
  skillCategory: {
    fontFamily: 'Times-Bold',
    marginRight: 6,
  },
});

export const CV = () => {
  const currentGPA = 3.39;
  
  return (
    <Document>
          <Page size="A3" style={styles.page}>
        <Text style={styles.name}>Kelvin Tan</Text>
        <Text style={styles.location}>Jakarta, Indonesia</Text>
        <View style={styles.contactRow}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <Image src="/assets/phone-call.png" style={{width: 12, height: 12, marginRight: 4, marginBottom: 4, alignSelf: 'center'}} />
            <Text style={styles.contactLink}>
                +62 813-7232-0146
            </Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <Image src="/assets/Gmail.png" style={{width: 12, height: 12, marginRight: 4, marginBottom: 4, alignSelf: 'center'}} />
            <Link src="mailto:kelvintan127.kt@gmail.com" style={styles.contactLink}>
              kelvintan127.kt@gmail.com
            </Link>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <Image src="/assets/linkedin.png" style={{width: 12, height: 12, marginRight: 4, marginBottom: 4, alignSelf: 'center'}} />
            <Link src="https://linkedin.com/in/kelvintan127" style={styles.contactLink}>
              Linkedin
            </Link>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <Image src="/assets/Github.png" style={{width: 12, height: 12, marginRight: 4, marginBottom: 4, alignSelf: 'center'}} />
            <Link src="https://klveen.com" style={styles.contactLink}>
              Portfolio
            </Link>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Summary</Text>
          <Text style={styles.bullet}>• Full-stack developer with experience in both frontend and backend development using modern technologies.</Text>
          <Text style={styles.bullet}>• Proficient in C# for backend development, Next.js for frontend applications, and Laravel for web projects.</Text>
          <Text style={styles.bullet}>• Strong foundation in building responsive web applications and RESTful APIs.</Text>
          <Text style={styles.bullet}>• Experienced in developing enterprise-level applications during internship with focus on backend systems.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relevant Coursework</Text>
          <View style={styles.courseworkGrid}>
            {courses.slice(0, 4).map((course, index) => (
              <Text key={index} style={styles.courseworkItem}>• {course.name}</Text>
            ))}
          </View>
          <View style={styles.courseworkGrid}>
            {courses.slice(4, 8).map((course, index) => (
              <Text key={index} style={styles.courseworkItem}>• {course.name}</Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experiences.map((exp, index) => (
            <View key={index} style={styles.section}>
              <View style={styles.experienceHeader}>
                <Text style={[styles.experienceTitle, {fontFamily: 'Times-Bold'}]}>{exp.title} - {exp.company}</Text>
                <Text style={[styles.experienceDate, {fontFamily: 'Times-Bold'}]}>{exp.period}</Text>
              </View>
              {exp.description.map((desc, idx) => (
                <Text key={idx} style={styles.bullet}>• {desc}</Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.slice(0, 3).map((project, idx) => (
            <View key={idx}>
              <Text style={styles.projectTitle}>{project.title} | <Text style={{fontFamily: 'Times-Italic'}}>{project.tech.slice(0, 3).join(", ")}</Text> | <Link src={project.github} style={[{ fontFamily: 'Times-Roman' }, styles.link]}>View the Website</Link></Text>
              {project.description.map((desc, descIdx) => (
                <Text key={descIdx} style={styles.bullet}>• {desc}</Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          {skills.map((skill, idx) => (
            <View key={idx} style={styles.skillsSection}>
              <Text>
                <Text style={styles.skillCategory}>{skill.category}: </Text>
                <Text key={idx} style={styles.bullet}>{skill.items.map(item => item.name).join(', ')}</Text>
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.experienceHeader}>
            <Text style={styles.experienceTitle}>Bina Nusantara University</Text>
            <Text style={styles.experienceDate}>Expected 2025   </Text>
          </View>
          <Text style={styles.bullet}>Bachelor of Computer Science - GPA: {<Text style={ { fontFamily: 'Times-Bold' } }>{currentGPA}</Text>}</Text>
        </View>
      </Page>
    </Document>
  );
};

export const generatePDF = async () => {
  const blob = await pdf(<CV />).toBlob();
  return blob;
}; 