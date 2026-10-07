import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('kaggle_import', Path(__file__).parent.parent / 'scripts/import-kaggle-indonesian.py')
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)


class KaggleNoteTests(unittest.TestCase):
    def test_punctuation_and_invisible_characters(self):
        self.assertEqual(importer.notes(' Bergamot., white musk\u200b, Cedarwood '), (['Bergamot', 'white musk', 'Cedarwood'], None))

    def test_missing_stage_does_not_become_a_note(self):
        for value in ['', '-', 'N/A', 'nan']:
            self.assertEqual(importer.notes(value), ([], None))

    def test_alternative_separator_requires_review(self):
        self.assertEqual(importer.notes('Jasmine/White Floral'), ([], 'ambiguous_note_separator'))

    def test_concatenated_note_list_is_not_guessed(self):
        self.assertEqual(importer.notes('vanilla absolute tonka bean ambroxan musk sandalwood'), ([], 'unparsed_note_list'))

    def test_explicit_conjunction_keeps_both_notes(self):
        self.assertEqual(importer.notes('Sumatran benzoin & Nutmeg'), (['Sumatran benzoin', 'Nutmeg'], None))


if __name__ == '__main__':
    unittest.main()
