import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('femaledaily_import', Path(__file__).parent.parent / 'scripts/import-femaledaily.py')
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)


class NoteExtractionTests(unittest.TestCase):
    def test_pyramid_stops_before_instructions(self):
        notes, error = importer.extract_notes('Top notes: Lemon, Pear • Heart: Rose | Iris • Base: Musk, VanillaHow to use: Spray on skin')
        self.assertIsNone(error)
        self.assertEqual(notes, {'top': ['Lemon', 'Pear'], 'middle': ['Rose', 'Iris'], 'base': ['Musk', 'Vanilla']})

    def test_connected_stage_labels_and_html_entities(self):
        notes, error = importer.extract_notes('Top: Pistachio, CassisHeart: Peony, JasmineBase: Vanilla, Musk&nbsp;')
        self.assertIsNone(error)
        self.assertEqual(notes['top'], ['Pistachio', 'Cassis'])
        self.assertEqual(notes['base'], ['Vanilla', 'Musk'])

    def test_explicit_conjunctions(self):
        notes, error = importer.extract_notes('Top: Lemon and Pear Middle: Rose dan Iris Base: Amber & Tiare')
        self.assertIsNone(error)
        self.assertEqual(notes['base'], ['Amber', 'Tiare'])

    def test_unlabeled_description_is_not_inferred(self):
        notes, error = importer.extract_notes('A fresh lemon opening with rose and a warm vanilla finish.')
        self.assertIsNone(notes)
        self.assertEqual(error, 'missing_or_ambiguous_pyramid')

    def test_incomplete_and_repeated_pyramids_are_rejected(self):
        for description in ['Top: Lemon Base: Musk', 'Top: Lemon Middle: Rose Base: Musk Top: Pear']:
            self.assertIsNone(importer.extract_notes(description)[0])

    def test_unknown_separators_are_rejected(self):
        self.assertIsNone(importer.extract_notes('Top: Lemon Middle: Jasmine/White Floral Base: Musk')[0])

    def test_concentration_and_reformulation_identity(self):
        name, concentration = importer.product_name({'product_name': 'Black Dahlia EDP', 'product_variant': 'Reformulasi in November 2022'})
        self.assertEqual(name, 'Black Dahlia (Reformulasi in November 2022)')
        self.assertEqual(concentration, 'Eau de Parfum')
        self.assertEqual(importer.product_name({'product_name': 'Fairytale Extrait de Perfume', 'product_variant': ''}), ('Fairytale', 'Extrait de Parfum'))


if __name__ == '__main__':
    unittest.main()
